// Week 3, broadcast: blind flooding against MPR relays on the visualizer's seed network.
// HELLOs carry each node's neighbor list, so every node learns its two-hop neighbors and
// picks MPRs by greedy set cover. Then A broadcasts one message.
// Run: ./ns3 run "broadcast --relay=mpr"   or   ./ns3 run "broadcast --relay=flooding"

#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units and node order; one unit is 50 m, a demo value.
const double kMetersPerUnit = 50;
const std::vector<std::string> kLabels = {"A", "B", "D", "E", "C", "G", "F"};
const std::vector<Vector> kPositions =
    {{1, 1, 0}, {0, 0, 0}, {2, 0, 0}, {2, 2, 0}, {0, -1, 0}, {3, -1, 0}, {3, 1, 0}};
// The slide's links, set as an explicit loss per pair: 50 dB on a link, 1000 dB (never heard) otherwise.
const std::vector<std::pair<std::string, std::string>> kLinks =
    {{"A", "B"}, {"A", "D"}, {"A", "E"}, {"B", "C"}, {"D", "G"}, {"D", "F"}, {"E", "F"}};
const double kLinkLoss = 50;
const double kNoLink = 1000;
const uint16_t kPort = 9;
const uint8_t kHello = 0;
const uint8_t kData = 1;

struct NodeState
{
    Ptr<Socket> socket;
    std::set<uint8_t> neighbors;
    std::map<uint8_t, std::set<uint8_t>> neighborsOf; // what each neighbor's HELLO listed
    std::set<uint8_t> mprs;
    bool seen = false;
};

std::string g_relay = "mpr";
double g_jitterMs = 10;
std::vector<NodeState> g_state;
Ptr<UniformRandomVariable> g_jitter;
uint32_t g_transmissions = 0;
uint32_t g_duplicates = 0;

uint32_t
Index(const std::string& label)
{
    return std::find(kLabels.begin(), kLabels.end(), label) - kLabels.begin();
}

void
Broadcast(uint8_t me, std::vector<uint8_t> bytes)
{
    g_state[me].socket->Send(Create<Packet>(bytes.data(), bytes.size()));
}

void
SendHello(uint8_t me)
{
    std::vector<uint8_t> hello = {kHello, me};
    hello.insert(hello.end(), g_state[me].neighbors.begin(), g_state[me].neighbors.end());
    Broadcast(me, hello);
}

// Greedy set cover over the two-hop neighbors (Misra pp. 126-127): first every neighbor that is
// the only way to some two-hop node, then the neighbor covering the most uncovered nodes, ties
// by node order.
void
SelectMprs(uint8_t me)
{
    NodeState& s = g_state[me];
    std::set<uint8_t> uncovered;
    for (uint8_t n : s.neighbors)
    {
        for (uint8_t w : s.neighborsOf[n])
        {
            if (w != me && s.neighbors.count(w) == 0)
            {
                uncovered.insert(w);
            }
        }
    }
    auto cover = [&](uint8_t n) {
        s.mprs.insert(n);
        for (uint8_t w : s.neighborsOf[n])
        {
            uncovered.erase(w);
        }
    };
    for (uint8_t w : std::set<uint8_t>(uncovered))
    {
        std::vector<uint8_t> via;
        for (uint8_t n : s.neighbors)
        {
            if (s.neighborsOf[n].count(w))
            {
                via.push_back(n);
            }
        }
        if (via.size() == 1)
        {
            cover(via[0]);
        }
    }
    while (!uncovered.empty())
    {
        uint8_t best = 0;
        size_t most = 0;
        for (uint8_t n : s.neighbors)
        {
            size_t count = 0;
            for (uint8_t w : s.neighborsOf[n])
            {
                count += uncovered.count(w);
            }
            if (count > most)
            {
                best = n;
                most = count;
            }
        }
        cover(best);
    }
}

void
Receive(Ptr<Socket> socket)
{
    uint8_t me = socket->GetNode()->GetId();
    NodeState& s = g_state[me];
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        std::vector<uint8_t> bytes(packet->GetSize());
        packet->CopyData(bytes.data(), bytes.size());
        uint8_t sender = bytes[1];
        if (bytes[0] == kHello)
        {
            s.neighbors.insert(sender);
            s.neighborsOf[sender] = std::set<uint8_t>(bytes.begin() + 2, bytes.end());
            continue;
        }
        if (s.seen)
        {
            g_duplicates++;
            continue; // a node relays only its first copy
        }
        s.seen = true;
        // Flooding relays every first copy. MPR relaying forwards only when the node it heard
        // the first copy from chose it as an MPR. A random delay spreads the relays out, since
        // two relays that cannot hear each other collide at any node that hears both.
        if (g_relay == "flooding" || g_state[sender].mprs.count(me))
        {
            Simulator::Schedule(MilliSeconds(g_jitter->GetValue(0, g_jitterMs)), [me]() {
                g_transmissions++;
                Broadcast(me, {kData, me});
            });
        }
    }
}

void
StartBroadcast(uint8_t source)
{
    std::cout << "A's MPRs:";
    for (uint8_t m : g_state[source].mprs)
    {
        std::cout << " " << kLabels[m];
    }
    std::cout << "\n";
    g_state[source].seen = true;
    g_transmissions++;
    Broadcast(source, {kData, source});
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.AddValue("relay", "mpr or flooding", g_relay);
    cmd.AddValue("jitter", "largest random relay delay, in ms", g_jitterMs);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    uint32_t n = kLabels.size();
    NodeContainer nodes;
    nodes.Create(n);
    MobilityHelper mobility;
    Ptr<ListPositionAllocator> positions = CreateObject<ListPositionAllocator>();
    for (const Vector& p : kPositions)
    {
        positions->Add(Vector(p.x * kMetersPerUnit, p.y * kMetersPerUnit, 0));
    }
    mobility.SetPositionAllocator(positions);
    mobility.Install(nodes);

    Ptr<MatrixPropagationLossModel> loss = CreateObject<MatrixPropagationLossModel>();
    loss->SetDefaultLoss(kNoLink);
    for (const auto& [a, b] : kLinks)
    {
        loss->SetLoss(nodes.Get(Index(a))->GetObject<MobilityModel>(),
                      nodes.Get(Index(b))->GetObject<MobilityModel>(),
                      kLinkLoss);
    }
    Ptr<YansWifiChannel> channel = CreateObject<YansWifiChannel>();
    channel->SetPropagationLossModel(loss);
    channel->SetPropagationDelayModel(CreateObject<ConstantSpeedPropagationDelayModel>());
    YansWifiPhyHelper phy;
    phy.SetChannel(channel);

    WifiHelper wifi;
    wifi.SetStandard(WIFI_STANDARD_80211b);
    wifi.SetRemoteStationManager("ns3::ConstantRateWifiManager",
                                 "DataMode", StringValue("DsssRate1Mbps"),
                                 "ControlMode", StringValue("DsssRate1Mbps"));
    WifiMacHelper mac;
    mac.SetType("ns3::AdhocWifiMac");
    NetDeviceContainer devices = wifi.Install(phy, mac, nodes);

    InternetStackHelper internet;
    internet.Install(nodes);
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    address.Assign(devices);

    g_jitter = CreateObject<UniformRandomVariable>();
    g_state.resize(n);
    for (uint8_t i = 0; i < n; i++)
    {
        Ptr<Socket> socket = Socket::CreateSocket(nodes.Get(i), UdpSocketFactory::GetTypeId());
        socket->Bind(InetSocketAddress(Ipv4Address::GetAny(), kPort));
        socket->SetAllowBroadcast(true);
        socket->Connect(InetSocketAddress(Ipv4Address::GetBroadcast(), kPort));
        socket->SetRecvCallback(MakeCallback(&Receive));
        g_state[i].socket = socket;
        // Three HELLO rounds: the first teaches neighbors, the next ones carry the neighbor lists.
        for (int round = 0; round < 3; round++)
        {
            Simulator::Schedule(Seconds(round + g_jitter->GetValue(0, 0.5)), &SendHello, i);
        }
        Simulator::Schedule(Seconds(4), &SelectMprs, i);
    }
    Simulator::Schedule(Seconds(5), &StartBroadcast, Index("A"));
    Simulator::Stop(Seconds(6));
    Simulator::Run();

    std::cout << "relay " << g_relay << ", jitter up to " << g_jitterMs << " ms: " << g_transmissions << " transmissions, " << g_duplicates
              << " duplicate copies\n";
    std::cout << "reached:";
    for (uint32_t i = 0; i < n; i++)
    {
        if (g_state[i].seen)
        {
            std::cout << " " << kLabels[i];
        }
    }
    std::cout << "\n";
    Simulator::Destroy();
    return 0;
}
