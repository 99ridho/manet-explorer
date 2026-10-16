// Week 4, clustering: the highest-ID or lowest-ID election on the visualizer's seed network.
// HELLOs carry node ids. A node declares itself head when it ranks first among its undecided
// neighbors; an undecided node that hears heads joins the best-ranked one and says so.
// Run: ./ns3 run "clustering --rule=highest"   or   ./ns3 run "clustering --rule=lowest"

#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <array>
#include <iostream>
#include <set>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units and node order; one unit is 50 m, a demo value.
// The labels are the node ids the election compares.
const double kMetersPerUnit = 50;
const std::vector<uint8_t> kIds = {9, 4, 2, 6, 8, 3, 5};
const std::vector<Vector> kPositions =
    {{1, 1, 0}, {0, 0, 0}, {0, 2, 0}, {2, 1, 0}, {3, 1, 0}, {4, 0, 0}, {4, 2, 0}};
// The slide's links, set as an explicit loss per pair: 50 dB on a link, 1000 dB (never heard) otherwise.
const std::vector<std::pair<uint8_t, uint8_t>> kLinks = {{9, 4}, {9, 2}, {9, 6}, {6, 8}, {8, 3}, {8, 5}};
const double kLinkLoss = 50;
const double kNoLink = 1000;
const uint16_t kPort = 9;
enum Kind : uint8_t
{
    HELLO,
    HEAD,
    JOIN
};

struct NodeState
{
    Ptr<Socket> socket;
    std::set<uint8_t> undecided; // neighbor ids not yet in a cluster
    std::set<uint8_t> headsHeard;
    uint8_t head = 0; // 0 while undecided
};

std::string g_rule = "highest";
std::vector<NodeState> g_state;
Ptr<UniformRandomVariable> g_jitter;

bool
RanksBefore(uint8_t a, uint8_t b)
{
    return g_rule == "highest" ? a > b : a < b;
}

uint32_t
Index(uint8_t id)
{
    return std::find(kIds.begin(), kIds.end(), id) - kIds.begin();
}

// Broadcasts get no ACK, and two neighbors that cannot hear each other collide at a node
// between them, so every message goes out three times, 300 ms apart.
void
Send(uint32_t i, Kind kind, uint8_t about)
{
    std::array<uint8_t, 3> bytes = {kind, kIds[i], about};
    for (int copy = 0; copy < 3; copy++)
    {
        Simulator::Schedule(MilliSeconds(300 * copy + g_jitter->GetValue(0, 100)),
                            [i, bytes]() { g_state[i].socket->Send(Create<Packet>(bytes.data(), 3)); });
    }
}

// The election step: an undecided node becomes head when no undecided neighbor ranks before it.
void
Evaluate(uint32_t i)
{
    NodeState& s = g_state[i];
    if (s.head != 0)
    {
        return;
    }
    for (uint8_t n : s.undecided)
    {
        if (RanksBefore(n, kIds[i]))
        {
            return;
        }
    }
    s.head = kIds[i];
    Send(i, HEAD, kIds[i]);
}

// Heads heard within 1 s all count; the node then joins the best-ranked one.
void
JoinBestHead(uint32_t i)
{
    NodeState& s = g_state[i];
    if (s.head != 0)
    {
        return;
    }
    s.head = *std::min_element(s.headsHeard.begin(), s.headsHeard.end(), RanksBefore);
    Send(i, JOIN, s.head);
}

void
Receive(Ptr<Socket> socket)
{
    uint32_t i = socket->GetNode()->GetId();
    NodeState& s = g_state[i];
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        uint8_t bytes[3];
        packet->CopyData(bytes, 3);
        uint8_t sender = bytes[1];
        if (bytes[0] == HELLO)
        {
            s.undecided.insert(sender);
            continue;
        }
        s.undecided.erase(sender);
        if (bytes[0] == HEAD)
        {
            if (s.headsHeard.empty())
            {
                Simulator::Schedule(Seconds(1), &JoinBestHead, i);
            }
            s.headsHeard.insert(sender);
        }
        else
        {
            Simulator::Schedule(MilliSeconds(10), &Evaluate, i); // a neighbor decided, so check again
        }
    }
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.AddValue("rule", "highest or lowest", g_rule);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    uint32_t n = kIds.size();
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
    for (uint32_t i = 0; i < n; i++)
    {
        Ptr<Socket> socket = Socket::CreateSocket(nodes.Get(i), UdpSocketFactory::GetTypeId());
        socket->Bind(InetSocketAddress(Ipv4Address::GetAny(), kPort));
        socket->SetAllowBroadcast(true);
        socket->Connect(InetSocketAddress(Ipv4Address::GetBroadcast(), kPort));
        socket->SetRecvCallback(MakeCallback(&Receive));
        g_state[i].socket = socket;
        Simulator::Schedule(Seconds(0), &Send, i, HELLO, 0);
        Simulator::Schedule(Seconds(2), &Evaluate, i);
    }
    Simulator::Stop(Seconds(10));
    Simulator::Run();

    std::cout << "rule " << g_rule << "\n";
    for (uint32_t i = 0; i < n; i++)
    {
        const NodeState& s = g_state[i];
        std::cout << "  node " << int(kIds[i]);
        if (s.head == kIds[i])
        {
            std::cout << " is a cluster head\n";
            continue;
        }
        std::cout << " joins head " << int(s.head);
        if (s.headsHeard.size() >= 2)
        {
            std::cout << ", gateway between heads";
            for (uint8_t h : s.headsHeard)
            {
                std::cout << " " << int(h);
            }
        }
        std::cout << "\n";
    }
    Simulator::Destroy();
    return 0;
}
