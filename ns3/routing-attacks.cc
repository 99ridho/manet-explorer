// Week 8, routing attacks: DSR-style discovery under a black hole or a wormhole, then ten data
// packets with a watchdog at S. The wormhole is a real point-to-point cable between M1 and M2,
// outside the radio channel.
// Run: ./ns3 run "routing-attacks --attacker=blackhole"   (or wormhole, none)

#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <vector>

using namespace ns3;

const double kMetersPerUnit = 50; // a demo value
const double kLinkLoss = 50;
const double kNoLink = 1000;
const uint16_t kPort = 9;
const uint32_t kThreshold = 3; // the watchdog reports a node past 3 failures, this demo's threshold
const uint32_t kPackets = 10;
enum Kind : uint8_t
{
    RREQ,
    RREP,
    DATA
};
typedef std::vector<uint8_t> Route;

std::string g_attacker = "blackhole";
std::vector<std::string> g_labels;
NodeContainer g_nodes;
std::vector<Ptr<Socket>> g_socket;
std::vector<bool> g_seen;
std::map<uint8_t, Ipv4Address> g_tunnelTo; // each tunnel end and its partner's cable address
std::map<Address, uint8_t> g_nodeOfMac;
uint8_t g_src = 0, g_dst = 0, g_blackHole = 255;
std::vector<Route> g_routes; // S's route cache, in order of arrival
Route g_route;
std::map<uint8_t, uint32_t> g_failures;
std::set<uint8_t> g_flagged;
uint8_t g_watching = 255;
bool g_heard = false;
Ptr<UniformRandomVariable> g_jitter;
uint32_t g_delivered = 0;

uint8_t
Index(const std::string& label)
{
    return std::find(g_labels.begin(), g_labels.end(), label) - g_labels.begin();
}

std::string
Show(const Route& route)
{
    std::string out;
    for (uint8_t v : route)
    {
        out += (out.empty() ? "" : " ") + g_labels[v];
    }
    return out;
}

Ipv4Address
WifiAddress(uint8_t i)
{
    return g_nodes.Get(i)->GetObject<Ipv4>()->GetAddress(1, 0).GetLocal();
}

// One hop: over the radio, or through the cable when both ends hold the tunnel.
void
SendTo(uint8_t me, uint8_t next, const std::vector<uint8_t>& bytes)
{
    Ipv4Address to = g_tunnelTo.count(me) && g_tunnelTo.count(next) ? g_tunnelTo[me] : WifiAddress(next);
    g_socket[me]->SendTo(Create<Packet>(bytes.data(), bytes.size()), 0, InetSocketAddress(to, kPort));
}

void
Broadcast(uint8_t me, const std::vector<uint8_t>& bytes)
{
    g_socket[me]->SendTo(Create<Packet>(bytes.data(), bytes.size()), 0, InetSocketAddress("10.1.1.255", kPort));
}

// Messages carry a route: [kind, seq or hop, length, route...].
std::vector<uint8_t>
Message(Kind kind, uint8_t field, const Route& route)
{
    std::vector<uint8_t> bytes = {kind, field, uint8_t(route.size())};
    bytes.insert(bytes.end(), route.begin(), route.end());
    return bytes;
}

void
Reply(uint8_t me, const Route& route)
{
    // The RREP walks the route backwards; the field holds its position on the route.
    uint8_t at = std::find(route.begin(), route.end(), me) - route.begin();
    SendTo(me, route[at - 1], Message(RREP, at - 1, route));
}

void
Receive(Ptr<Socket> socket)
{
    uint8_t me = socket->GetNode()->GetId();
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        std::vector<uint8_t> m(packet->GetSize());
        packet->CopyData(m.data(), m.size());
        Route route(m.begin() + 3, m.begin() + 3 + m[2]);
        if (m[0] == RREQ)
        {
            if (me == g_dst)
            {
                route.push_back(me);
                Reply(me, route); // the destination answers every copy
                continue;
            }
            if (g_seen[me])
            {
                continue; // drop the duplicate copy
            }
            g_seen[me] = true;
            route.push_back(me);
            if (me == g_blackHole)
            {
                route.push_back(g_dst);
                std::cout << g_labels[me] << " answers at once, claiming the route " << Show(route) << "\n";
                Reply(me, route);
                continue; // and never passes the RREQ on
            }
            if (g_tunnelTo.count(me) && route.size() >= 2 && g_tunnelTo.count(route[route.size() - 2]))
            {
                std::cout << g_labels[me] << " replays the RREQ that came through the tunnel\n";
            }
            else if (g_tunnelTo.count(me))
            {
                uint8_t far = me == Index("M1") ? Index("M2") : Index("M1");
                SendTo(me, far, Message(RREQ, 0, route));
            }
            // A random delay keeps two relays that cannot hear each other from colliding.
            Simulator::Schedule(MilliSeconds(g_jitter->GetValue(0, 10)), &Broadcast, me, Message(RREQ, 0, route));
        }
        else if (m[0] == RREP)
        {
            if (me != g_src)
            {
                SendTo(me, route[m[1] - 1], Message(RREP, m[1] - 1, route));
                continue;
            }
            std::cout << "t = " << Simulator::Now().GetMilliSeconds() << " ms: S gets an RREP with " << Show(route) << "\n";
            g_routes.push_back(route);
        }
        else
        {
            uint8_t hop = m[1];
            if (me == g_dst)
            {
                g_delivered++;
                continue;
            }
            if (me == g_blackHole)
            {
                continue; // dropped without a trace
            }
            SendTo(me, route[hop + 1], Message(DATA, hop + 1, route));
        }
    }
}

// The watchdog: S hears every frame in range, including frames addressed to other nodes.
bool
Overhear(Ptr<NetDevice>, Ptr<const Packet> frame, uint16_t, const Address& from, const Address&, NetDevice::PacketType)
{
    Ptr<Packet> p = frame->Copy();
    Ipv4Header ip;
    UdpHeader udp;
    p->RemoveHeader(ip);
    if (ip.GetProtocol() != UdpL4Protocol::PROT_NUMBER)
    {
        return true;
    }
    p->RemoveHeader(udp);
    uint8_t m[3];
    p->CopyData(m, 3);
    if (m[0] == DATA && g_nodeOfMac.count(from) && g_nodeOfMac[from] == g_watching)
    {
        g_heard = true;
    }
    return true;
}

Route
FirstRouteAvoiding()
{
    for (const Route& r : g_routes)
    {
        bool clean = std::none_of(r.begin(), r.end(), [](uint8_t v) { return g_flagged.count(v) > 0; });
        if (clean)
        {
            return r;
        }
    }
    return {};
}

void
Judge(uint8_t seq)
{
    uint8_t next = g_watching;
    if (next == g_dst || g_heard)
    {
        std::cout << "packet " << int(seq) << ": S hears " << g_labels[next] << " pass it on\n";
        return;
    }
    uint32_t f = ++g_failures[next];
    std::cout << "packet " << int(seq) << ": S never hears " << g_labels[next] << " pass it on, " << f
              << (f == 1 ? " failure\n" : " failures\n");
    if (f > kThreshold && g_flagged.insert(next).second)
    {
        g_route = FirstRouteAvoiding();
        std::cout << "S reports " << g_labels[next] << " and switches to " << (g_route.empty() ? "no route" : Show(g_route))
                  << "\n";
    }
}

void
SendData(uint8_t seq)
{
    if (seq == 1)
    {
        g_route = g_routes.empty() ? Route() : g_routes.front();
        std::cout << "S uses the first route to arrive: " << Show(g_route) << "\n";
    }
    if (g_route.size() < 2)
    {
        return;
    }
    g_watching = g_route[1];
    g_heard = false;
    SendTo(g_src, g_route[1], Message(DATA, 1, g_route));
    Simulator::Schedule(MilliSeconds(100), &Judge, seq);
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.AddValue("attacker", "blackhole, wormhole, or none", g_attacker);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    // The visualizer's seeds: one network for the black hole and no attacker, one for the wormhole.
    std::vector<Vector> positions;
    std::vector<std::pair<std::string, std::string>> links;
    if (g_attacker == "wormhole")
    {
        g_labels = {"S", "A", "M1", "B", "C", "M2", "D"};
        positions = {{0, 1, 0}, {1, 0, 0}, {1, 2, 0}, {2, 0, 0}, {3, 0, 0}, {3, 2, 0}, {4, 1, 0}};
        links = {{"S", "A"}, {"A", "B"}, {"B", "C"}, {"C", "D"}, {"S", "M1"}, {"M2", "D"}};
    }
    else
    {
        g_labels = {"S", "A", "M", "B", "D"};
        positions = {{0, 1, 0}, {1, 0, 0}, {1, 2, 0}, {2, 0, 0}, {3, 1, 0}};
        links = {{"S", "A"}, {"S", "M"}, {"A", "B"}, {"B", "D"}};
    }
    uint32_t n = g_labels.size();
    g_src = Index("S");
    g_dst = Index("D");
    g_nodes.Create(n);
    MobilityHelper mobility;
    Ptr<ListPositionAllocator> alloc = CreateObject<ListPositionAllocator>();
    for (const Vector& p : positions)
    {
        alloc->Add(Vector(p.x * kMetersPerUnit, p.y * kMetersPerUnit, 0));
    }
    mobility.SetPositionAllocator(alloc);
    mobility.Install(g_nodes);

    // The slide's links, set as an explicit loss per pair.
    Ptr<MatrixPropagationLossModel> loss = CreateObject<MatrixPropagationLossModel>();
    loss->SetDefaultLoss(kNoLink);
    for (const auto& [a, b] : links)
    {
        loss->SetLoss(g_nodes.Get(Index(a))->GetObject<MobilityModel>(),
                      g_nodes.Get(Index(b))->GetObject<MobilityModel>(),
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
    NetDeviceContainer devices = wifi.Install(phy, mac, g_nodes);

    InternetStackHelper internet;
    internet.Install(g_nodes);
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    address.Assign(devices);
    if (g_attacker == "wormhole")
    {
        // The tunnel: a 100 Mbps cable with 1 ms delay, faster than any path over the 1 Mbps radio.
        PointToPointHelper cable;
        cable.SetDeviceAttribute("DataRate", StringValue("100Mbps"));
        cable.SetChannelAttribute("Delay", StringValue("1ms"));
        NetDeviceContainer ends = cable.Install(g_nodes.Get(Index("M1")), g_nodes.Get(Index("M2")));
        address.SetBase("10.2.2.0", "255.255.255.0");
        Ipv4InterfaceContainer cableIps = address.Assign(ends);
        g_tunnelTo[Index("M1")] = cableIps.GetAddress(1);
        g_tunnelTo[Index("M2")] = cableIps.GetAddress(0);
    }
    if (g_attacker == "blackhole")
    {
        g_blackHole = Index("M");
    }

    g_jitter = CreateObject<UniformRandomVariable>();
    g_seen.assign(n, false);
    for (uint8_t i = 0; i < n; i++)
    {
        g_socket.push_back(Socket::CreateSocket(g_nodes.Get(i), UdpSocketFactory::GetTypeId()));
        g_socket[i]->Bind(InetSocketAddress(Ipv4Address::GetAny(), kPort));
        g_socket[i]->SetAllowBroadcast(true);
        g_socket[i]->SetRecvCallback(MakeCallback(&Receive));
        g_nodeOfMac[devices.Get(i)->GetAddress()] = i;
    }
    devices.Get(g_src)->SetPromiscReceiveCallback(MakeCallback(&Overhear));

    std::cout << "attacker " << g_attacker << "\n";
    Simulator::Schedule(Seconds(1), [] {
        g_seen[g_src] = true;
        Broadcast(g_src, Message(RREQ, 0, {g_src}));
    });
    for (uint8_t seq = 1; seq <= kPackets; seq++)
    {
        Simulator::Schedule(Seconds(2 + 0.5 * seq), &SendData, seq);
    }
    Simulator::Stop(Seconds(10));
    Simulator::Run();
    std::cout << "D received " << g_delivered << " of " << kPackets << " packets\n";
    Simulator::Destroy();
    return 0;
}
