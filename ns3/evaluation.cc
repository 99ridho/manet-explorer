// Week 6, network models and evaluation: the unit disk graph against the quasi unit disk graph.
// The script prints the seed network's links under the chosen model, then repeats one experiment
// over ten seeds and reports the mean delivery ratio with its standard deviation.
// Run: ./ns3 run "evaluation --graph=udg"   or   ./ns3 run "evaluation --graph=qudg"

#include "ns3/aodv-module.h"
#include "ns3/applications-module.h"
#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <cmath>
#include <iomanip>
#include <iostream>
#include <map>
#include <vector>

using namespace ns3;

const double kMetersPerUnit = 50; // a demo value
const double kQ = 0.8;            // QUDG's q, a demo value

// Quasi unit disk: always linked within q * range, never beyond range, and in between linked or
// not by one fair draw per pair, kept for the whole run (Loo pp. 41-42 leave the probability open;
// 0.5 is this demo's choice).
class QuasiUnitDiskLossModel : public PropagationLossModel
{
  public:
    static TypeId GetTypeId()
    {
        static TypeId tid = TypeId("QuasiUnitDiskLossModel")
                                .SetParent<PropagationLossModel>()
                                .AddConstructor<QuasiUnitDiskLossModel>();
        return tid;
    }

    double range = 0;
    double q = 1;

  private:
    double DoCalcRxPower(double txPowerDbm, Ptr<MobilityModel> a, Ptr<MobilityModel> b) const override
    {
        double d = a->GetDistanceFrom(b);
        if (d <= q * range)
        {
            return txPowerDbm;
        }
        if (d > range)
        {
            return -1000;
        }
        auto key = a < b ? std::make_pair(a, b) : std::make_pair(b, a);
        if (m_linked.count(key) == 0)
        {
            m_linked[key] = m_draw->GetValue() < 0.5;
        }
        return m_linked[key] ? txPowerDbm : -1000;
    }

    int64_t DoAssignStreams(int64_t stream) override
    {
        m_draw->SetStream(stream);
        return 1;
    }

    Ptr<UniformRandomVariable> m_draw = CreateObject<UniformRandomVariable>();
    mutable std::map<std::pair<Ptr<MobilityModel>, Ptr<MobilityModel>>, bool> m_linked;
};

Ptr<QuasiUnitDiskLossModel>
MakeLoss(const std::string& graph, double rangeUnits)
{
    Ptr<QuasiUnitDiskLossModel> loss = CreateObject<QuasiUnitDiskLossModel>();
    loss->range = rangeUnits * kMetersPerUnit;
    loss->q = graph == "qudg" ? kQ : 1; // with q = 1 the model is the unit disk
    return loss;
}

NodeContainer
Place(const std::vector<Vector>& units)
{
    NodeContainer nodes;
    nodes.Create(units.size());
    MobilityHelper mobility;
    Ptr<ListPositionAllocator> positions = CreateObject<ListPositionAllocator>();
    for (const Vector& p : units)
    {
        positions->Add(Vector(p.x * kMetersPerUnit, p.y * kMetersPerUnit, 0));
    }
    mobility.SetPositionAllocator(positions);
    mobility.Install(nodes);
    return nodes;
}

// The visualizer's seed network: which pairs the chosen model links.
void
PrintSeedLinks(const std::string& graph)
{
    std::vector<std::string> labels = {"A", "B", "C", "D", "E", "F", "G", "H"};
    NodeContainer nodes = Place(
        {{0, 0, 0}, {1, 0.6, 0}, {1, -0.6, 0}, {2, 0, 0}, {3, 0, 0}, {4, 0.6, 0}, {4, -0.6, 0}, {5, 0, 0}});
    Ptr<QuasiUnitDiskLossModel> loss = MakeLoss(graph, 1.2);
    std::cout << "seed network, range 1.2 units, links:";
    uint32_t count = 0;
    for (uint32_t i = 0; i < nodes.GetN(); i++)
    {
        for (uint32_t j = i + 1; j < nodes.GetN(); j++)
        {
            if (loss->CalcRxPower(0, nodes.Get(i)->GetObject<MobilityModel>(), nodes.Get(j)->GetObject<MobilityModel>()) > -1000)
            {
                std::cout << " " << labels[i] << "-" << labels[j];
                count++;
            }
        }
    }
    std::cout << " (" << count << ")\n";
    Simulator::Destroy();
}

// One run: 10 nodes placed at random in a 6 x 4 area with range 2 (the visualizer's demo value), AODV, and
// three flows of ten packets between random pairs. Returns the share of packets delivered.
double
RunOnce(const std::string& graph, uint32_t run)
{
    RngSeedManager::SetRun(run);
    Ptr<UniformRandomVariable> u = CreateObject<UniformRandomVariable>();
    std::vector<Vector> units;
    for (int i = 0; i < 10; i++)
    {
        units.push_back(Vector(u->GetValue(0, 6), u->GetValue(0, 4), 0));
    }
    NodeContainer nodes = Place(units);

    Ptr<YansWifiChannel> channel = CreateObject<YansWifiChannel>();
    channel->SetPropagationLossModel(MakeLoss(graph, 2));
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

    AodvHelper aodv;
    InternetStackHelper internet;
    internet.SetRoutingHelper(aodv);
    internet.Install(nodes);
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    Ipv4InterfaceContainer ifaces = address.Assign(devices);

    std::vector<Ptr<UdpServer>> sinks;
    for (uint16_t flow = 0; flow < 3; flow++)
    {
        uint32_t src = u->GetInteger(0, 9);
        uint32_t dst = (src + 1 + u->GetInteger(0, 8)) % 10;
        uint16_t port = 1000 + flow;
        UdpServerHelper server(port);
        ApplicationContainer s = server.Install(nodes.Get(dst));
        sinks.push_back(DynamicCast<UdpServer>(s.Get(0)));
        UdpClientHelper client(ifaces.GetAddress(dst), port);
        client.SetAttribute("MaxPackets", UintegerValue(10));
        client.SetAttribute("Interval", TimeValue(MilliSeconds(500)));
        client.Install(nodes.Get(src)).Start(Seconds(1 + flow));
    }
    Simulator::Stop(Seconds(15));
    Simulator::Run();
    uint64_t received = 0;
    for (const auto& sink : sinks)
    {
        received += sink->GetReceived();
    }
    Simulator::Destroy();
    return 100.0 * received / 30;
}

int
main(int argc, char* argv[])
{
    std::string graph = "udg";
    uint32_t seeds = 10;
    CommandLine cmd;
    cmd.AddValue("graph", "udg or qudg", graph);
    cmd.AddValue("seeds", "how many seeded runs to average", seeds);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(1);

    std::cout << std::fixed << std::setprecision(1) << "graph " << graph << "\n";
    PrintSeedLinks(graph);
    std::vector<double> pdr;
    for (uint32_t run = 1; run <= seeds; run++)
    {
        pdr.push_back(RunOnce(graph, run));
        std::cout << "seed " << run << ": " << pdr.back() << " % delivered\n";
    }
    double mean = 0, var = 0;
    for (double p : pdr)
    {
        mean += p / pdr.size();
    }
    for (double p : pdr)
    {
        var += (p - mean) * (p - mean) / pdr.size();
    }
    std::cout << "over " << seeds << " seeds: mean " << mean << " %, standard deviation " << std::sqrt(var) << "\n";
    return 0;
}
