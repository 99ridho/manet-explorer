// Week 1, multihop links: the visualizer's seed network over an 802.11b ad hoc radio.
// Every node broadcasts one hello per second; a link is a pair where each end heard the other.
// Run: ./ns3 run "multihop --model=disk"   or   ./ns3 run "multihop --model=shadowing"

#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/wifi-module.h"

#include <cmath>
#include <iomanip>
#include <iostream>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units. One unit is 50 m, a demo value.
const double kMetersPerUnit = 50;
const double kRangeUnits = 2;
const std::vector<std::string> kLabels = {"A", "B", "C", "D", "E", "F"};
const std::vector<Vector> kPositions = {{0, 1, 0}, {0, -1, 0}, {1, 0, 0}, {3, 0, 0}, {4, 1, 0}, {4, -1, 0}};
const uint32_t kHellos = 50;
const uint16_t kPort = 9;

std::vector<std::vector<uint32_t>> g_heard; // g_heard[receiver][sender]

void
ReceiveHello(Ptr<Socket> socket)
{
    uint32_t me = socket->GetNode()->GetId();
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        uint8_t sender;
        packet->CopyData(&sender, 1);
        g_heard[me][sender]++;
    }
}

void
SendHello(Ptr<Socket> socket, uint32_t left)
{
    uint8_t me = socket->GetNode()->GetId();
    socket->Send(Create<Packet>(&me, 1));
    if (left > 1)
    {
        Simulator::Schedule(Seconds(1), &SendHello, socket, left - 1);
    }
}

int
main(int argc, char* argv[])
{
    std::string model = "disk";
    uint32_t seed = 1;
    CommandLine cmd;
    cmd.AddValue("model", "disk (unit disk) or shadowing (log distance with a Gaussian fade)", model);
    cmd.AddValue("seed", "random stream for hello jitter and fades", seed);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(seed);

    uint32_t n = kLabels.size();
    double range = kRangeUnits * kMetersPerUnit;
    NodeContainer nodes;
    nodes.Create(n);

    MobilityHelper mobility;
    Ptr<ListPositionAllocator> positions = CreateObject<ListPositionAllocator>();
    for (const Vector& p : kPositions)
    {
        positions->Add(Vector(p.x * kMetersPerUnit, p.y * kMetersPerUnit, 0));
    }
    mobility.SetPositionAllocator(positions);
    mobility.SetMobilityModel("ns3::ConstantPositionMobilityModel");
    mobility.Install(nodes);

    // Physical layer. Unit disk: full power up to and including the range, nothing beyond it.
    YansWifiChannelHelper channel;
    channel.SetPropagationDelay("ns3::ConstantSpeedPropagationDelayModel");
    YansWifiPhyHelper phy;
    if (model == "disk")
    {
        channel.AddPropagationLoss("ns3::RangePropagationLossModel", "MaxRange", DoubleValue(range));
    }
    else
    {
        // Path loss exponent 2 (free space) plus a fade drawn per packet, sigma 4 dB (a demo value).
        // The receiver threshold sits at the mean power at the range, so the mean margin there is 0 dB.
        channel.AddPropagationLoss("ns3::LogDistancePropagationLossModel", "Exponent", DoubleValue(2));
        channel.AddPropagationLoss("ns3::RandomPropagationLossModel",
                                   "Variable",
                                   StringValue("ns3::NormalRandomVariable[Mean=0|Variance=16]"));
        double txPower = 16.0206;          // YansWifiPhy's default TxPowerStart, dBm
        double lossAt1m = 46.6777;         // LogDistance's default ReferenceLoss, dB
        double threshold = txPower - lossAt1m - 20 * std::log10(range);
        phy.Set("RxSensitivity", DoubleValue(threshold));
        phy.Set("CcaEdThreshold", DoubleValue(threshold));
    }
    phy.SetChannel(channel.Create());

    // MAC: 802.11b ad hoc at a fixed 1 Mbps, so rate adaptation does not change the range.
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

    // Hellos are one-hop UDP broadcasts. Random start times keep neighbors from colliding every round.
    g_heard.assign(n, std::vector<uint32_t>(n, 0));
    Ptr<UniformRandomVariable> jitter = CreateObject<UniformRandomVariable>();
    TypeId udp = UdpSocketFactory::GetTypeId();
    for (uint32_t i = 0; i < n; i++)
    {
        Ptr<Socket> rx = Socket::CreateSocket(nodes.Get(i), udp);
        rx->Bind(InetSocketAddress(Ipv4Address::GetAny(), kPort));
        rx->SetRecvCallback(MakeCallback(&ReceiveHello));
        Ptr<Socket> tx = Socket::CreateSocket(nodes.Get(i), udp);
        tx->SetAllowBroadcast(true);
        tx->Connect(InetSocketAddress(Ipv4Address::GetBroadcast(), kPort));
        Simulator::Schedule(Seconds(jitter->GetValue(0, 1)), &SendHello, tx, kHellos);
    }
    Simulator::Stop(Seconds(kHellos + 2));
    Simulator::Run();

    std::cout << "model " << model << ", seed " << seed << ", range " << range << " m ("
              << kRangeUnits << " units at " << kMetersPerUnit << " m per unit)\n";
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Hellos heard, out of " << kHellos << " sent by each node:\n";
    for (uint32_t i = 0; i < n; i++)
    {
        std::cout << "  " << kLabels[i] << " hears";
        bool any = false;
        for (uint32_t j = 0; j < n; j++)
        {
            if (g_heard[i][j] > 0)
            {
                std::cout << " " << kLabels[j] << " " << g_heard[i][j];
                any = true;
            }
        }
        std::cout << (any ? "\n" : " nobody\n");
    }

    // ETX = 1 / (w_pq * w_qp): the frame must arrive and so must the reply (Misra Definitions 1.5 and 1.6).
    std::cout << "Links (each end heard the other):\n";
    uint32_t links = 0;
    for (uint32_t p = 0; p < n; p++)
    {
        for (uint32_t q = p + 1; q < n; q++)
        {
            if (g_heard[q][p] == 0 || g_heard[p][q] == 0)
            {
                continue;
            }
            double wpq = double(g_heard[q][p]) / kHellos;
            double wqp = double(g_heard[p][q]) / kHellos;
            std::cout << "  " << kLabels[p] << "-" << kLabels[q] << "  delivery " << wpq << " and " << wqp
                      << ", ETX " << 1 / (wpq * wqp) << "\n";
            links++;
        }
    }
    std::cout << links << " links among " << n << " nodes\n";

    Simulator::Destroy();
    return 0;
}
