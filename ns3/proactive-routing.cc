// Week 2, proactive routing: DSDV on the visualizer's seed network.
// The tables converge, M3 moves next to M6 at 45 s, and M2's table shows the new route to M3.
// ns-3's DSDV sends both kinds of update: a full dump every 15 s and an incremental one
// whenever a route changes. The script counts each kind.
// Run: ./ns3 run proactive-routing

#include "ns3/core-module.h"
#include "ns3/dsdv-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <sstream>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units; one unit is 50 m, a demo value.
const double kMetersPerUnit = 50;
const std::vector<std::string> kLabels = {"M1", "M2", "M3", "M4", "M5", "M6"};
const std::vector<Vector> kPositions = {{0, 1, 0}, {1, 1, 0}, {1, 2, 0}, {2, 1, 0}, {3, 0, 0}, {3, 2, 0}};
// The slide's links, set as an explicit loss per pair: 50 dB on a link, 1000 dB (never heard) otherwise.
const std::vector<std::pair<std::string, std::string>> kLinks =
    {{"M1", "M2"}, {"M2", "M3"}, {"M2", "M4"}, {"M4", "M5"}, {"M4", "M6"}};
const double kLinkLoss = 50;
const double kNoLink = 1000;
const uint16_t kDsdvPort = 269;
const uint32_t kRowBytes = 12; // one DSDV header: destination, hop count, sequence number

NodeContainer g_nodes;
Ptr<MatrixPropagationLossModel> g_loss;
uint32_t g_fullDumps = 0;
uint32_t g_incremental = 0;

uint32_t
Index(const std::string& label)
{
    return std::find(kLabels.begin(), kLabels.end(), label) - kLabels.begin();
}

void
SetLink(const std::string& a, const std::string& b, double loss)
{
    g_loss->SetLoss(g_nodes.Get(Index(a))->GetObject<MobilityModel>(),
                    g_nodes.Get(Index(b))->GetObject<MobilityModel>(),
                    loss);
}

// ns-3 prints tables with IP addresses; the script keeps one row per slide node, with labels.
void
PrintTable(const std::string& label)
{
    std::ostringstream raw;
    Ptr<OutputStreamWrapper> stream = Create<OutputStreamWrapper>(&raw);
    g_nodes.Get(Index(label))->GetObject<Ipv4>()->GetRoutingProtocol()->PrintRoutingTable(stream);
    std::map<std::string, std::string> labelOf;
    for (uint32_t i = 0; i < kLabels.size(); i++)
    {
        labelOf["10.1.1." + std::to_string(i + 1)] = kLabels[i];
    }
    std::cout << "t = " << Simulator::Now().GetSeconds() << " s, " << label << "'s table:\n";
    std::cout << "  dest  next  hops  seq\n";
    std::istringstream lines(raw.str());
    for (std::string line; std::getline(lines, line);)
    {
        std::istringstream row(line);
        std::string dest, next, iface, hops, seq;
        row >> dest >> next >> iface >> hops >> seq;
        if (labelOf.count(dest) && labelOf.count(next) && labelOf[dest] != label)
        {
            std::cout << "  " << std::left << std::setw(6) << labelOf[dest] << std::setw(6) << labelOf[next]
                      << std::setw(6) << hops << seq << "\n";
        }
    }
}

void
MoveM3()
{
    std::cout << "t = 45 s: M3 moves next to M6\n";
    g_nodes.Get(Index("M3"))->GetObject<MobilityModel>()->SetPosition(Vector(3.8 * kMetersPerUnit, 2 * kMetersPerUnit, 0));
    SetLink("M2", "M3", kNoLink);
    SetLink("M3", "M6", kLinkLoss);
}

// A full dump carries a row for every node; an incremental update carries only changed rows.
void
CountUpdate(std::string, Ptr<const Packet> frame)
{
    Ptr<Packet> p = frame->Copy();
    LlcSnapHeader llc;
    p->RemoveHeader(llc);
    if (llc.GetType() != Ipv4L3Protocol::PROT_NUMBER)
    {
        return;
    }
    Ipv4Header ip;
    UdpHeader udp;
    p->RemoveHeader(ip);
    if (ip.GetProtocol() != UdpL4Protocol::PROT_NUMBER)
    {
        return;
    }
    p->RemoveHeader(udp);
    if (udp.GetDestinationPort() != kDsdvPort)
    {
        return;
    }
    if (p->GetSize() / kRowBytes >= kLabels.size())
    {
        g_fullDumps++;
    }
    else
    {
        g_incremental++;
    }
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    g_nodes.Create(kLabels.size());
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
        SetLink(a, b, kLinkLoss);
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

    DsdvHelper dsdv;
    dsdv.Set("PeriodicUpdateInterval", TimeValue(Seconds(15)));
    InternetStackHelper internet;
    internet.SetRoutingHelper(dsdv);
    internet.Install(g_nodes);
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    address.Assign(devices);

    Config::Connect("/NodeList/*/DeviceList/*/$ns3::WifiNetDevice/Mac/MacTx", MakeCallback(&CountUpdate));
    Simulator::Schedule(Seconds(40), &PrintTable, "M2");
    Simulator::Schedule(Seconds(45), &MoveM3);
    Simulator::Schedule(Seconds(90), &PrintTable, "M2");
    Simulator::Stop(Seconds(90.5));
    Simulator::Run();

    std::cout << g_fullDumps << " updates carried every row (full dumps), " << g_incremental
              << " carried fewer (incremental) in 90 s\n";
    Simulator::Destroy();
    return 0;
}
