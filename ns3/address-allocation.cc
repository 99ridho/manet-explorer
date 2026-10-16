// Week 4, address allocation: a new node D joins the visualizer's seed network by Buddy
// allocation or by query-based duplicate address detection (QDAD), then configures the
// address it got on its Wi-Fi interface. D has no IP address while it asks, so the protocol
// runs over raw link-layer frames.
// Run: ./ns3 run "address-allocation --scheme=buddy"   or   ./ns3 run "address-allocation --scheme=qdad"
// Try ./ns3 run "address-allocation --scheme=qdad --first=11" to make D's first pick collide with B.

#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <iostream>
#include <set>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units; one unit is 50 m and the range is 1.2 units, both demo
// values. D stands where the visualizer places a node that joins through C.
// Addresses run from 1 to 16, the visualizer's space; the script maps address k to 10.0.0.k.
const double kMetersPerUnit = 50;
const double kRangeUnits = 1.2;
const std::vector<std::string> kLabels = {"A", "B", "C", "D"};
const std::vector<Vector> kPositions = {{0, 0, 0}, {1, 0, 0}, {2, 0, 0}, {2.5, -0.8, 0}};
const uint8_t kSpace = 16;
const uint16_t kProtocol = 0x88B5; // an EtherType set aside for local experiments
const uint32_t kNewNode = 3;
const int kTries = 3; // the slide says the AREQ repeats up to a limit; 3 is this demo's

enum Kind : uint8_t
{
    JOIN,  // Buddy: D asks who can give it a range
    OFFER, // Buddy: a neighbor offers, telling the size of its largest range
    PICK,  // Buddy: D picks one neighbor
    POOL,  // Buddy: the picked neighbor hands over half its range
    AREQ,  // QDAD: is this address in use?
    AREP   // QDAD: yes, I use it
};

struct NodeState
{
    Ptr<Socket> socket;
    uint8_t address = 0;
    uint8_t lo = 0, hi = 0; // Buddy: the range this node holds
    std::set<std::vector<uint8_t>> relayed;
};

std::string g_scheme = "buddy";
uint32_t g_first = 0;
NodeContainer g_nodes;
std::vector<NodeState> g_state;
Ptr<UniformRandomVariable> g_random;
uint8_t g_bestOffer = 0, g_bestFrom = 0;
uint8_t g_candidate = 0;
int g_try = 0;
bool g_answered = false;
uint32_t g_areqSent = 0;

void
Send(uint32_t i, std::vector<uint8_t> bytes)
{
    Simulator::Schedule(MilliSeconds(g_random->GetValue(0, 10)),
                        [i, bytes]() { g_state[i].socket->Send(Create<Packet>(bytes.data(), bytes.size())); });
}

void
Configure(uint8_t address)
{
    g_state[kNewNode].address = address;
    Ptr<Ipv4> ip = g_nodes.Get(kNewNode)->GetObject<Ipv4>();
    uint32_t wifi = ip->AddInterface(g_nodes.Get(kNewNode)->GetDevice(0));
    std::string text = "10.0.0." + std::to_string(address);
    ip->AddAddress(wifi, Ipv4InterfaceAddress(Ipv4Address(text.c_str()), "255.255.255.0"));
    ip->SetUp(wifi);
    std::cout << "D configures " << ip->GetAddress(wifi, 0).GetLocal() << " on its Wi-Fi interface\n";
}

void
PickOffer()
{
    if (g_bestOffer == 0)
    {
        std::cout << "no neighbor has a range left to split, so D cannot join\n";
        return;
    }
    std::cout << "D picks " << kLabels[g_bestFrom] << ", whose largest range has " << int(g_bestOffer)
              << " addresses\n";
    Send(kNewNode, {PICK, uint8_t(kNewNode), g_bestFrom});
}

void
AskAddress()
{
    if (g_answered)
    {
        g_answered = false;
        g_try = 0;
        g_candidate = 1 + g_random->GetInteger(0, kSpace - 1);
    }
    if (g_try == kTries)
    {
        std::cout << kTries << " AREQs got no AREP, so D takes " << int(g_candidate) << "\n";
        std::cout << g_areqSent << " AREQ transmissions in all, counting relays\n";
        Configure(g_candidate);
        return;
    }
    g_try++;
    std::cout << "D floods AREQ(" << int(g_candidate) << "), try " << g_try << "\n";
    g_areqSent++;
    Send(kNewNode, {AREQ, uint8_t(kNewNode), g_candidate, uint8_t(g_try)});
    Simulator::Schedule(MilliSeconds(500), &AskAddress);
}

void
Receive(Ptr<Socket> socket)
{
    uint32_t me = socket->GetNode()->GetId();
    NodeState& s = g_state[me];
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        std::vector<uint8_t> m(packet->GetSize());
        packet->CopyData(m.data(), m.size());
        uint8_t from = m[1];
        if (m[0] == JOIN && s.address != 0)
        {
            Send(me, {OFFER, uint8_t(me), uint8_t(s.hi - s.lo + 1)});
        }
        else if (m[0] == OFFER && me == kNewNode && m[2] > 1 && m[2] > g_bestOffer)
        {
            g_bestOffer = m[2];
            g_bestFrom = from;
        }
        else if (m[0] == PICK && m[2] == me)
        {
            // The picked node gives away the upper half; on this seed its own address is in the lower half.
            uint8_t mid = s.lo + (s.hi - s.lo + 1) / 2;
            std::cout << kLabels[me] << " keeps " << int(s.lo) << " to " << int(mid - 1) << " and gives "
                      << int(mid) << " to " << int(s.hi) << " to D\n";
            Send(me, {POOL, uint8_t(me), uint8_t(kNewNode), mid, s.hi});
            s.hi = mid - 1;
        }
        else if (m[0] == POOL && m[2] == me && s.address == 0)
        {
            s.lo = m[3];
            s.hi = m[4];
            std::cout << "D takes address " << int(s.lo) << " without asking any other node\n";
            // Not inside this callback: adding an interface changes the handler list ns-3 is walking.
            Simulator::ScheduleNow(&Configure, s.lo);
        }
        else if (m[0] == AREQ || m[0] == AREP)
        {
            // Every node relays each AREQ and AREP once, so they reach the whole network.
            if (me == kNewNode && m[0] == AREP && m[2] == g_candidate)
            {
                std::cout << kLabels[from] << " answers AREP(" << int(m[2]) << "): the address is taken\n";
                g_answered = true;
                continue;
            }
            if (me == kNewNode || !s.relayed.insert(m).second)
            {
                continue;
            }
            if (m[0] == AREQ && s.address == m[2])
            {
                Send(me, {AREP, uint8_t(me), m[2], m[3]});
                continue;
            }
            if (m[0] == AREQ)
            {
                g_areqSent++;
            }
            Send(me, m);
        }
    }
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.AddValue("scheme", "buddy or qdad", g_scheme);
    cmd.AddValue("first", "QDAD: D's first pick, 1 to 16 (0 draws it at random)", g_first);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    uint32_t n = kLabels.size();
    g_nodes.Create(n);
    MobilityHelper mobility;
    Ptr<ListPositionAllocator> positions = CreateObject<ListPositionAllocator>();
    for (const Vector& p : kPositions)
    {
        positions->Add(Vector(p.x * kMetersPerUnit, p.y * kMetersPerUnit, 0));
    }
    mobility.SetPositionAllocator(positions);
    mobility.Install(g_nodes);

    YansWifiChannelHelper channel;
    channel.SetPropagationDelay("ns3::ConstantSpeedPropagationDelayModel");
    channel.AddPropagationLoss("ns3::RangePropagationLossModel", "MaxRange", DoubleValue(kRangeUnits * kMetersPerUnit));
    YansWifiPhyHelper phy;
    phy.SetChannel(channel.Create());

    WifiHelper wifi;
    wifi.SetStandard(WIFI_STANDARD_80211b);
    wifi.SetRemoteStationManager("ns3::ConstantRateWifiManager",
                                 "DataMode", StringValue("DsssRate1Mbps"),
                                 "ControlMode", StringValue("DsssRate1Mbps"));
    WifiMacHelper mac;
    mac.SetType("ns3::AdhocWifiMac");
    NetDeviceContainer devices = wifi.Install(phy, mac, g_nodes);
    InternetStackHelper internet; // also installs the packet sockets the protocol uses
    internet.Install(g_nodes);

    // The seed state: A started with the whole space, B joined through A, then C through B.
    g_state.resize(n);
    g_state[0].address = 1, g_state[0].lo = 1, g_state[0].hi = 8;
    g_state[1].address = 9, g_state[1].lo = 9, g_state[1].hi = 12;
    g_state[2].address = 13, g_state[2].lo = 13, g_state[2].hi = 16;
    if (g_scheme == "qdad")
    {
        g_state[0].address = 5, g_state[1].address = 11, g_state[2].address = 2;
    }
    for (uint32_t i = 0; i < n; i++)
    {
        PacketSocketAddress local;
        local.SetSingleDevice(devices.Get(i)->GetIfIndex());
        local.SetProtocol(kProtocol);
        PacketSocketAddress all = local;
        all.SetPhysicalAddress(devices.Get(i)->GetBroadcast());
        g_state[i].socket = Socket::CreateSocket(g_nodes.Get(i), PacketSocketFactory::GetTypeId());
        g_state[i].socket->Bind(local);
        g_state[i].socket->Connect(all);
        g_state[i].socket->SetRecvCallback(MakeCallback(&Receive));
    }

    g_random = CreateObject<UniformRandomVariable>();
    std::cout << "scheme " << g_scheme << ", addresses:";
    for (uint32_t i = 0; i + 1 < n; i++)
    {
        std::cout << " " << kLabels[i] << " " << int(g_state[i].address);
    }
    std::cout << "\n";
    if (g_scheme == "buddy")
    {
        Simulator::Schedule(Seconds(1), &Send, kNewNode, std::vector<uint8_t>{JOIN, uint8_t(kNewNode)});
        Simulator::Schedule(Seconds(1.2), &PickOffer);
    }
    else
    {
        g_candidate = g_first != 0 ? g_first : 1 + g_random->GetInteger(0, kSpace - 1);
        Simulator::Schedule(Seconds(1), &AskAddress);
    }
    Simulator::Stop(Seconds(10));
    Simulator::Run();
    Simulator::Destroy();
    return 0;
}
