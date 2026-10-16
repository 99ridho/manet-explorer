// Week 7, QoS, ETX, and energy-aware routing on the visualizer's seed network.
// The script picks A's path to E by the chosen metric from the visualizer's example link values,
// installs it as static routes, and sends one packet every 0.5 s for 300 s. Each link loses
// frames at its example delivery ratio, and each node runs on a battery.
// Run: ./ns3 run "qos-routing --metric=etx"   (or bandwidth, energy, hop)

#include "ns3/applications-module.h"
#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <functional>
#include <iomanip>
#include <iostream>
#include <map>
#include <vector>

using namespace ns3;

// The visualizer's seed and its example values (the slide gives the topology and the 3 Mbps
// request only). One unit is 50 m, and one battery unit is 5 J of radio energy: demo values.
const double kMetersPerUnit = 50;
const double kJoulesPerUnit = 5;
const double kNeedMbps = 3;
const std::vector<std::string> kLabels = {"A", "B", "C", "D", "E"};
const std::vector<Vector> kPositions = {{0, 1, 0}, {1, 2, 0}, {2, 2, 0}, {1, 0, 0}, {3, 1, 0}};
const std::vector<double> kBattery = {100, 20, 60, 80, 100};

struct LinkValues
{
    std::string a, b;
    double mbps;
    double delivery; // w, the same in both directions
};

const std::vector<LinkValues> kLinks = {{"A", "B", 4, 0.9},
                                        {"B", "C", 5, 0.9},
                                        {"C", "E", 4, 0.9},
                                        {"A", "D", 2, 0.5},
                                        {"D", "E", 6, 0.6}};

uint32_t
Index(const std::string& label)
{
    return std::find(kLabels.begin(), kLabels.end(), label) - kLabels.begin();
}

const LinkValues*
Link(uint32_t p, uint32_t q)
{
    for (const LinkValues& l : kLinks)
    {
        if ((Index(l.a) == p && Index(l.b) == q) || (Index(l.a) == q && Index(l.b) == p))
        {
            return &l;
        }
    }
    return nullptr;
}

// A lossy link: every transmission from p to q arrives with probability w(p,q), else it is lost.
// This applies to data frames and to the ACKs that come back, the two halves ETX counts.
class FlakyLinkLossModel : public PropagationLossModel
{
  public:
    static TypeId GetTypeId()
    {
        static TypeId tid = TypeId("FlakyLinkLossModel")
                                .SetParent<PropagationLossModel>()
                                .AddConstructor<FlakyLinkLossModel>();
        return tid;
    }

  private:
    double DoCalcRxPower(double txPowerDbm, Ptr<MobilityModel> a, Ptr<MobilityModel> b) const override
    {
        const LinkValues* l = Link(a->GetObject<Node>()->GetId(), b->GetObject<Node>()->GetId());
        if (!l || m_draw->GetValue() > l->delivery)
        {
            return -1000;
        }
        return txPowerDbm - 50;
    }

    int64_t DoAssignStreams(int64_t stream) override
    {
        m_draw->SetStream(stream);
        return 1;
    }

    Ptr<UniformRandomVariable> m_draw = CreateObject<UniformRandomVariable>();
};

// Every simple path from A to E, by depth-first search.
void
Paths(uint32_t v, uint32_t dst, std::vector<uint32_t>& path, std::vector<std::vector<uint32_t>>& out)
{
    if (v == dst)
    {
        out.push_back(path);
        return;
    }
    for (uint32_t w = 0; w < kLabels.size(); w++)
    {
        if (Link(v, w) && std::find(path.begin(), path.end(), w) == path.end())
        {
            path.push_back(w);
            Paths(w, dst, path, out);
            path.pop_back();
        }
    }
}

double
Etx(const std::vector<uint32_t>& path)
{
    double sum = 0;
    for (size_t i = 0; i + 1 < path.size(); i++)
    {
        double w = Link(path[i], path[i + 1])->delivery;
        sum += 1 / (w * w);
    }
    return sum;
}

double
MinRelayBattery(const std::vector<uint32_t>& path)
{
    double least = 1e9;
    for (size_t i = 1; i + 1 < path.size(); i++)
    {
        least = std::min(least, kBattery[path[i]]);
    }
    return least;
}

bool
CarriesNeed(const std::vector<uint32_t>& path)
{
    for (size_t i = 0; i + 1 < path.size(); i++)
    {
        if (Link(path[i], path[i + 1])->mbps < kNeedMbps)
        {
            return false;
        }
    }
    return true;
}

// The path each metric prefers; ties go to fewer hops, then to the order the search found them.
std::vector<uint32_t>
Choose(const std::string& metric, const std::vector<std::vector<uint32_t>>& paths)
{
    std::function<bool(const std::vector<uint32_t>&, const std::vector<uint32_t>&)> better;
    if (metric == "etx")
    {
        better = [](auto& x, auto& y) { return Etx(x) < Etx(y) - 1e-9; };
    }
    else if (metric == "energy")
    {
        better = [](auto& x, auto& y) { return MinRelayBattery(x) > MinRelayBattery(y); };
    }
    else
    {
        better = [](auto& x, auto& y) { return x.size() < y.size(); };
    }
    std::vector<uint32_t> best;
    for (const auto& p : paths)
    {
        if (metric == "bandwidth" && !CarriesNeed(p))
        {
            continue;
        }
        if (best.empty() || better(p, best) || (!better(best, p) && p.size() < best.size()))
        {
            best = p;
        }
    }
    return best;
}

NodeContainer g_nodes;
uint32_t g_dataFrames = 0;
std::vector<double> g_joules;

// The battery: the PHY logs how long it spent in each state, and each state draws the current of
// ns-3's WifiRadioEnergyModel defaults at 3 V. (In ns-3.49 that model can switch itself off early,
// because a nested reschedule leaks an event, so the script charges the battery itself.)
double
StateCurrentA(WifiPhyState state)
{
    switch (state)
    {
    case WifiPhyState::TX:
        return 0.380;
    case WifiPhyState::RX:
        return 0.313;
    case WifiPhyState::SLEEP:
        return 0.033;
    case WifiPhyState::OFF:
        return 0;
    default:
        return 0.273; // idle, carrier sensed busy, switching
    }
}

void
Drain(uint32_t i, Time, Time duration, WifiPhyState state)
{
    if (g_joules[i] <= 0)
    {
        return;
    }
    g_joules[i] -= StateCurrentA(state) * 3.0 * duration.GetSeconds();
    if (g_joules[i] <= 0)
    {
        g_joules[i] = 0;
        std::cout << kLabels[i] << "'s battery ran out at " << std::setprecision(0) << Simulator::Now().GetSeconds()
                  << " s, so its radio turns off\n" << std::setprecision(2);
        // Not inside this trace: the PHY is in the middle of changing state.
        Simulator::ScheduleNow(&WifiPhy::SetOffMode, DynamicCast<WifiNetDevice>(g_nodes.Get(i)->GetDevice(0))->GetPhy());
    }
}

void
CountDataFrame(WifiConstPsduMap psdus, WifiTxVector, double)
{
    for (const auto& [id, psdu] : psdus)
    {
        if (psdu->GetHeader(0).IsData())
        {
            g_dataFrames++;
        }
    }
}

int
main(int argc, char* argv[])
{
    std::string metric = "bandwidth";
    CommandLine cmd;
    cmd.AddValue("metric", "bandwidth, etx, energy, or hop", metric);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    std::vector<std::vector<uint32_t>> paths;
    std::vector<uint32_t> start = {Index("A")};
    Paths(Index("A"), Index("E"), start, paths);
    std::vector<uint32_t> path = Choose(metric, paths);
    std::cout << std::fixed << std::setprecision(2) << "metric " << metric << ": path";
    for (uint32_t v : path)
    {
        std::cout << " " << kLabels[v];
    }
    std::cout << " (ETX " << Etx(path) << ", weakest relay battery " << MinRelayBattery(path) << ")\n";

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

    Ptr<YansWifiChannel> channel = CreateObject<YansWifiChannel>();
    channel->SetPropagationLossModel(CreateObject<FlakyLinkLossModel>());
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

    for (uint32_t i = 0; i < n; i++)
    {
        g_joules.push_back(kBattery[i] * kJoulesPerUnit);
        Ptr<WifiPhy> radio = DynamicCast<WifiNetDevice>(devices.Get(i))->GetPhy();
        radio->GetState()->TraceConnectWithoutContext("State", MakeBoundCallback(&Drain, i));
    }

    InternetStackHelper internet;
    internet.Install(g_nodes);
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    Ipv4InterfaceContainer ifaces = address.Assign(devices);

    // The chosen path as static routes: each node on it sends traffic for E to the next node.
    Ipv4StaticRoutingHelper staticRouting;
    for (size_t i = 0; i + 1 < path.size(); i++)
    {
        Ptr<Ipv4StaticRouting> table = staticRouting.GetStaticRouting(g_nodes.Get(path[i])->GetObject<Ipv4>());
        table->AddHostRouteTo(ifaces.GetAddress(Index("E")), ifaces.GetAddress(path[i + 1]), 1);
    }

    UdpServerHelper server(9);
    ApplicationContainer sink = server.Install(g_nodes.Get(Index("E")));
    UdpClientHelper client(ifaces.GetAddress(Index("E")), 9);
    client.SetAttribute("MaxPackets", UintegerValue(600));
    client.SetAttribute("Interval", TimeValue(MilliSeconds(500)));
    client.Install(g_nodes.Get(Index("A"))).Start(Seconds(1));

    Config::ConnectWithoutContext("/NodeList/*/DeviceList/*/$ns3::WifiNetDevice/Phy/PhyTxPsduBegin",
                                  MakeCallback(&CountDataFrame));
    Simulator::Stop(Seconds(302));
    Simulator::Run();

    uint64_t got = DynamicCast<UdpServer>(sink.Get(0))->GetReceived();
    std::cout << "E received " << got << " of 600 packets; the radios sent " << g_dataFrames
              << " data frames, retries included\n";
    Simulator::Destroy();
    return 0;
}
