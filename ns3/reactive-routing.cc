// Week 2, reactive routing: AODV or DSR on the visualizer's seed network.
// S sends one UDP echo to D per second. At 10 s the last link of the route breaks,
// and the protocol finds the other way round.
// Run: ./ns3 run "reactive-routing --protocol=aodv"   or   ./ns3 run "reactive-routing --protocol=dsr"

#include "ns3/aodv-module.h"
#include "ns3/applications-module.h"
#include "ns3/core-module.h"
#include "ns3/dsr-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <iostream>
#include <map>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units; one unit is 50 m, a demo value.
const double kMetersPerUnit = 50;
const std::vector<std::string> kLabels = {"S", "A", "B", "C", "E", "D"};
const std::vector<Vector> kPositions = {{0, 1, 0}, {1, 0, 0}, {1, 2, 0}, {2, 0, 0}, {2, 2, 0}, {3, 1, 0}};
// The slide's links. A distance rule cannot give them (B-C is shorter than A-B), so every
// pair gets an explicit loss: 50 dB on a link, 1000 dB (never heard) otherwise.
const std::vector<std::pair<std::string, std::string>> kLinks =
    {{"S", "A"}, {"S", "B"}, {"A", "B"}, {"A", "C"}, {"B", "E"}, {"C", "D"}, {"E", "D"}};
const double kLinkLoss = 50;
const double kNoLink = 1000;

std::string g_protocol = "aodv";
NodeContainer g_nodes;
Ptr<MatrixPropagationLossModel> g_loss;
std::map<Ipv4Address, uint32_t> g_nodeOf;
uint32_t g_broadcasts = 0;
uint32_t g_replies = 0;

uint32_t
Index(const std::string& label)
{
    return std::find(kLabels.begin(), kLabels.end(), label) - kLabels.begin();
}

Ipv4Address
AddressOf(uint32_t i)
{
    return g_nodes.Get(i)->GetObject<Ipv4>()->GetAddress(1, 0).GetLocal();
}

void
SetLink(uint32_t a, uint32_t b, double loss)
{
    g_loss->SetLoss(g_nodes.Get(a)->GetObject<MobilityModel>(), g_nodes.Get(b)->GetObject<MobilityModel>(), loss);
}

// The route S uses now, as node indexes. AODV keeps only a next hop per node, so the
// script walks the next hops; DSR keeps the whole route in the source's cache.
std::vector<uint32_t>
CurrentRoute(uint32_t src, uint32_t dst)
{
    std::vector<uint32_t> route = {src};
    if (g_protocol == "dsr")
    {
        dsr::DsrRouteCacheEntry entry;
        Ptr<dsr::DsrRouting> dsr = g_nodes.Get(src)->GetObject<dsr::DsrRouting>();
        if (!dsr->LookupRoute(AddressOf(dst), entry))
        {
            return {};
        }
        route.clear();
        for (const Ipv4Address& hop : entry.GetVector())
        {
            route.push_back(g_nodeOf[hop]);
        }
        return route;
    }
    Ipv4Header header;
    header.SetDestination(AddressOf(dst));
    Socket::SocketErrno err;
    for (uint32_t v = src; v != dst && route.size() <= kLabels.size();)
    {
        Ptr<Ipv4RoutingProtocol> aodv = g_nodes.Get(v)->GetObject<Ipv4>()->GetRoutingProtocol();
        Ptr<Ipv4Route> next = aodv->RouteOutput(Create<Packet>(), header, nullptr, err);
        if (!next || g_nodeOf.count(next->GetGateway()) == 0)
        {
            return {};
        }
        v = g_nodeOf[next->GetGateway()];
        route.push_back(v);
    }
    return route;
}

std::string
Show(const std::vector<uint32_t>& route)
{
    if (route.empty())
    {
        return "no route";
    }
    std::string out;
    for (uint32_t v : route)
    {
        out += (out.empty() ? "" : " ") + kLabels[v];
    }
    return out;
}

void
PrintRoute()
{
    std::cout << "t = " << Simulator::Now().GetSeconds() << " s: S reaches D through "
              << Show(CurrentRoute(Index("S"), Index("D"))) << "\n";
}

void
BreakLastLink()
{
    std::vector<uint32_t> route = CurrentRoute(Index("S"), Index("D"));
    if (route.size() < 2)
    {
        std::cout << "t = 10 s: S has no route, so no link breaks\n";
        return;
    }
    uint32_t a = route[route.size() - 2];
    uint32_t b = route.back();
    SetLink(a, b, kNoLink);
    std::cout << "t = 10 s: link " << kLabels[a] << "-" << kLabels[b] << " breaks\n";
}

// Route requests and route errors go out as IP broadcasts; data and replies are unicast.
void
CountBroadcast(std::string, Ptr<const Packet> frame)
{
    Ptr<Packet> p = frame->Copy();
    LlcSnapHeader llc;
    p->RemoveHeader(llc);
    if (llc.GetType() != Ipv4L3Protocol::PROT_NUMBER)
    {
        return; // ARP
    }
    Ipv4Header ip;
    p->PeekHeader(ip);
    if (ip.GetDestination().IsBroadcast() || ip.GetDestination().IsSubnetDirectedBroadcast("255.255.255.0"))
    {
        g_broadcasts++;
    }
}

void
CountReply(Ptr<const Packet>)
{
    g_replies++;
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.AddValue("protocol", "aodv or dsr", g_protocol);
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

    g_loss = CreateObject<MatrixPropagationLossModel>();
    g_loss->SetDefaultLoss(kNoLink);
    for (const auto& [a, b] : kLinks)
    {
        SetLink(Index(a), Index(b), kLinkLoss);
    }
    Ptr<YansWifiChannel> channel = CreateObject<YansWifiChannel>();
    channel->SetPropagationLossModel(g_loss);
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
    if (g_protocol == "aodv")
    {
        // No HELLOs: a node learns a broken link when the MAC gives up on a frame.
        // TtlStart equal to NetDiameter turns off the expanding ring, so one RREQ floods the network.
        AodvHelper aodv;
        aodv.Set("EnableHello", BooleanValue(false));
        aodv.Set("TtlStart", UintegerValue(35));
        internet.SetRoutingHelper(aodv);
        internet.Install(g_nodes);
    }
    else
    {
        internet.Install(g_nodes);
        DsrMainHelper dsrMain;
        DsrHelper dsr;
        dsrMain.Install(dsr, g_nodes);
    }
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    address.Assign(devices);
    for (uint32_t i = 0; i < n; i++)
    {
        g_nodeOf[AddressOf(i)] = i;
    }

    // UDP echo rather than ping: ns-3's ping uses a raw socket, which bypasses DSR.
    UdpEchoServerHelper server(9);
    server.Install(g_nodes.Get(Index("D"))).Start(Seconds(1));
    UdpEchoClientHelper client(AddressOf(Index("D")), 9);
    client.SetAttribute("MaxPackets", UintegerValue(25));
    client.SetAttribute("Interval", TimeValue(Seconds(1)));
    ApplicationContainer apps = client.Install(g_nodes.Get(Index("S")));
    apps.Start(Seconds(2));
    apps.Get(0)->TraceConnectWithoutContext("Rx", MakeCallback(&CountReply));

    Config::Connect("/NodeList/*/DeviceList/*/$ns3::WifiNetDevice/Mac/MacTx", MakeCallback(&CountBroadcast));
    Simulator::Schedule(Seconds(8), &PrintRoute);
    Simulator::Schedule(Seconds(10), &BreakLastLink);
    Simulator::Schedule(Seconds(25), &PrintRoute);
    Simulator::Stop(Seconds(30));

    std::cout << "protocol " << g_protocol << "\n";
    Simulator::Run();
    std::cout << "S got " << g_replies << " of 25 echo replies\n";
    std::cout << g_broadcasts << " RREQ and RERR broadcasts in all\n";
    Simulator::Destroy();
    return 0;
}
