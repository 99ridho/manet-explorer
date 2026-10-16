// Week 3, geographic routing: greedy forwarding with a GPSR-style perimeter walk, on the
// visualizer's seed network. Beacons carry positions; the packet carries D's position, its mode,
// and where greedy got stuck. Each node decides the next hop from its neighbor table alone.
// Run: ./ns3 run "geographic-routing --recovery=perimeter"   or   ./ns3 run "geographic-routing --recovery=none"

#include "ns3/core-module.h"
#include "ns3/internet-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"
#include "ns3/propagation-module.h"
#include "ns3/wifi-module.h"

#include <algorithm>
#include <cmath>
#include <cstring>
#include <iomanip>
#include <iostream>
#include <map>
#include <optional>
#include <vector>

using namespace ns3;

// The visualizer's seed, in slide units; one unit is 50 m, a demo value. With a range of
// 1.6 units the unit disk rule gives exactly the slide's links.
const double kMetersPerUnit = 50;
const double kRangeUnits = 1.6;
const std::vector<std::string> kLabels = {"S", "F", "A", "B", "C", "E", "D"};
const std::vector<Vector> kPositions =
    {{2, 2, 0}, {1.2, 2.6, 0}, {1.4, 1, 0}, {2.2, 0.2, 0}, {3.4, 0.3, 0}, {4.3, 1.1, 0}, {4, 2, 0}};
const uint16_t kBeaconPort = 9;
const uint16_t kDataPort = 10;
const uint8_t kNone = 255;

// The fixed part of a data packet; the route so far follows it, one byte per node.
struct GeoHeader
{
    uint8_t perimeter; // 0 greedy, 1 perimeter
    uint8_t dst;
    double dstX, dstY;   // the source knows D's position (a location service is assumed)
    double stuckX, stuckY; // where greedy failed
    double crossX, crossY; // the last point where the walk crossed the line from stuck to D
    uint8_t prev;
    uint8_t firstHop; // the first perimeter edge, to detect a full loop
    uint8_t stuck;
};

std::string g_recovery = "perimeter";
NodeContainer g_nodes;
std::vector<Ptr<Socket>> g_beacon;
std::vector<Ptr<Socket>> g_data;
std::vector<std::map<uint8_t, Vector>> g_table; // what each node learned from beacons

double
Dist(double ax, double ay, double bx, double by)
{
    return std::hypot(ax - bx, ay - by);
}

Vector
Here(uint8_t me)
{
    return g_nodes.Get(me)->GetObject<MobilityModel>()->GetPosition();
}

std::string
Units(double meters)
{
    std::ostringstream out;
    out << std::fixed << std::setprecision(2) << meters / kMetersPerUnit;
    return out.str();
}

void
SendBeacon(uint8_t me)
{
    Vector p = Here(me);
    uint8_t bytes[1 + 2 * sizeof(double)];
    bytes[0] = me;
    std::memcpy(bytes + 1, &p.x, sizeof(double));
    std::memcpy(bytes + 1 + sizeof(double), &p.y, sizeof(double));
    g_beacon[me]->Send(Create<Packet>(bytes, sizeof(bytes)));
}

void
ReceiveBeacon(Ptr<Socket> socket)
{
    uint8_t me = socket->GetNode()->GetId();
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        uint8_t bytes[1 + 2 * sizeof(double)];
        packet->CopyData(bytes, sizeof(bytes));
        Vector p;
        std::memcpy(&p.x, bytes + 1, sizeof(double));
        std::memcpy(&p.y, bytes + 1 + sizeof(double), sizeof(double));
        g_table[me][bytes[0]] = p;
    }
}

// Gabriel graph from local knowledge: keep v-n when no other neighbor of v lies inside the
// circle whose diameter is v-n.
bool
Planar(uint8_t v, uint8_t n)
{
    Vector a = Here(v);
    Vector b = g_table[v][n];
    double mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, r = Dist(a.x, a.y, b.x, b.y) / 2;
    for (const auto& [w, p] : g_table[v])
    {
        if (w != n && Dist(p.x, p.y, mx, my) < r - 1e-9)
        {
            return false;
        }
    }
    return true;
}

// The first planar neighbor clockwise from the direction of `from`; `from` itself comes last.
uint8_t
NextClockwise(uint8_t v, double fromX, double fromY)
{
    Vector p = Here(v);
    double ref = std::atan2(fromY - p.y, fromX - p.x);
    uint8_t best = kNone;
    double bestTurn = 1e9;
    for (const auto& [n, q] : g_table[v])
    {
        if (!Planar(v, n))
        {
            continue;
        }
        double turn = std::fmod(ref - std::atan2(q.y - p.y, q.x - p.x), 2 * M_PI);
        if (turn <= 1e-9)
        {
            turn += 2 * M_PI;
        }
        if (turn < bestTurn)
        {
            bestTurn = turn;
            best = n;
        }
    }
    return best;
}

// Where segment p1-p2 crosses segment q1-q2, ignoring a touch at p1.
std::optional<Vector>
Crossing(Vector p1, Vector p2, Vector q1, Vector q2)
{
    double rx = p2.x - p1.x, ry = p2.y - p1.y, sx = q2.x - q1.x, sy = q2.y - q1.y;
    double den = rx * sy - ry * sx;
    if (std::abs(den) < 1e-12)
    {
        return std::nullopt;
    }
    double t = ((q1.x - p1.x) * sy - (q1.y - p1.y) * sx) / den;
    double u = ((q1.x - p1.x) * ry - (q1.y - p1.y) * rx) / den;
    if (t <= 1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9)
    {
        return std::nullopt;
    }
    return Vector(p1.x + t * rx, p1.y + t * ry, 0);
}

void
Forward(uint8_t me, GeoHeader h, std::vector<uint8_t> path)
{
    path.push_back(me);
    std::string at = kLabels[me];
    if (me == h.dst)
    {
        std::cout << "delivered after " << path.size() - 1 << " hops:";
        for (uint8_t v : path)
        {
            std::cout << " " << kLabels[v];
        }
        std::cout << "\n";
        return;
    }
    Vector p = Here(me);
    double myDist = Dist(p.x, p.y, h.dstX, h.dstY);
    if (h.perimeter && myDist < Dist(h.stuckX, h.stuckY, h.dstX, h.dstY) - 1e-9)
    {
        std::cout << at << " is " << Units(myDist) << " from D, closer than " << kLabels[h.stuck]
                  << ", so the packet returns to greedy mode\n";
        h.perimeter = 0;
    }
    uint8_t next = kNone;
    if (!h.perimeter)
    {
        // Greedy: the neighbor closest to D, and only if it is closer than this node.
        double best = myDist;
        for (const auto& [n, q] : g_table[me])
        {
            double d = Dist(q.x, q.y, h.dstX, h.dstY);
            if (d < best - 1e-9)
            {
                best = d;
                next = n;
            }
        }
        if (next != kNone)
        {
            std::cout << at << " forwards greedily to " << kLabels[next];
            std::cout << (next == h.dst ? "\n" : " (" + Units(best) + " from D)\n");
        }
        else if (g_recovery == "none")
        {
            std::cout << "no neighbor of " << at << " is closer to D than " << Units(myDist)
                      << ", so greedy forwarding drops the packet\n";
            return;
        }
        else
        {
            std::cout << "no neighbor of " << at << " is closer to D than " << Units(myDist)
                      << ", so the packet switches to perimeter mode\n";
            h.perimeter = 1;
            h.stuck = me;
            h.stuckX = h.crossX = p.x;
            h.stuckY = h.crossY = p.y;
            h.prev = kNone;
            h.firstHop = kNone;
        }
    }
    if (h.perimeter)
    {
        Vector from = h.prev == kNone ? Vector(h.dstX, h.dstY, 0) : g_table[me][h.prev];
        next = NextClockwise(me, from.x, from.y);
        // GPSR face change: skip an edge that crosses the line from stuck to D nearer D than the last crossing.
        Vector stuck(h.stuckX, h.stuckY, 0), dst(h.dstX, h.dstY, 0);
        for (int turns = 0; next != kNone && turns < 8; turns++)
        {
            auto x = Crossing(p, g_table[me][next], stuck, dst);
            if (!x || Dist(x->x, x->y, dst.x, dst.y) >= Dist(h.crossX, h.crossY, dst.x, dst.y) - 1e-9)
            {
                break;
            }
            std::cout << at << " skips the link to " << kLabels[next] << ", which crosses the line to D\n";
            h.crossX = x->x;
            h.crossY = x->y;
            next = NextClockwise(me, g_table[me][next].x, g_table[me][next].y);
        }
        if (next == kNone || (me == h.stuck && next == h.firstHop))
        {
            std::cout << "the walk came back to " << kLabels[h.stuck] << " without getting closer, so D is unreachable\n";
            return;
        }
        if (h.firstHop == kNone)
        {
            h.firstHop = next;
        }
        std::cout << at << " sweeps clockwise and forwards to " << kLabels[next] << "\n";
        h.prev = me;
    }
    std::vector<uint8_t> bytes(sizeof(GeoHeader));
    std::memcpy(bytes.data(), &h, sizeof(GeoHeader));
    bytes.insert(bytes.end(), path.begin(), path.end());
    // A unicast to the neighbor's address: the MAC acknowledges it and retries on loss.
    Ipv4Address to = g_nodes.Get(next)->GetObject<Ipv4>()->GetAddress(1, 0).GetLocal();
    g_data[me]->SendTo(Create<Packet>(bytes.data(), bytes.size()), 0, InetSocketAddress(to, kDataPort));
}

void
ReceiveData(Ptr<Socket> socket)
{
    uint8_t me = socket->GetNode()->GetId();
    Ptr<Packet> packet;
    while ((packet = socket->Recv()))
    {
        std::vector<uint8_t> bytes(packet->GetSize());
        packet->CopyData(bytes.data(), bytes.size());
        GeoHeader h;
        std::memcpy(&h, bytes.data(), sizeof(GeoHeader));
        Forward(me, h, std::vector<uint8_t>(bytes.begin() + sizeof(GeoHeader), bytes.end()));
    }
}

void
Start(uint8_t src, uint8_t dst)
{
    Vector d = Here(dst);
    GeoHeader h{};
    h.dst = dst;
    h.dstX = d.x;
    h.dstY = d.y;
    h.prev = h.firstHop = h.stuck = kNone;
    Forward(src, h, {});
}

int
main(int argc, char* argv[])
{
    CommandLine cmd;
    cmd.AddValue("recovery", "perimeter or none (greedy only)", g_recovery);
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

    InternetStackHelper internet;
    internet.Install(g_nodes);
    Ipv4AddressHelper address;
    address.SetBase("10.1.1.0", "255.255.255.0");
    address.Assign(devices);

    Ptr<UniformRandomVariable> jitter = CreateObject<UniformRandomVariable>();
    g_table.resize(n);
    TypeId udp = UdpSocketFactory::GetTypeId();
    for (uint8_t i = 0; i < n; i++)
    {
        g_beacon.push_back(Socket::CreateSocket(g_nodes.Get(i), udp));
        g_beacon[i]->Bind(InetSocketAddress(Ipv4Address::GetAny(), kBeaconPort));
        g_beacon[i]->SetAllowBroadcast(true);
        g_beacon[i]->Connect(InetSocketAddress(Ipv4Address::GetBroadcast(), kBeaconPort));
        g_beacon[i]->SetRecvCallback(MakeCallback(&ReceiveBeacon));
        g_data.push_back(Socket::CreateSocket(g_nodes.Get(i), udp));
        g_data[i]->Bind(InetSocketAddress(Ipv4Address::GetAny(), kDataPort));
        g_data[i]->SetRecvCallback(MakeCallback(&ReceiveData));
        // Three beacon rounds, so a beacon lost to a collision is heard the next time.
        for (int round = 0; round < 3; round++)
        {
            Simulator::Schedule(Seconds(round + jitter->GetValue(0, 0.5)), &SendBeacon, i);
        }
    }
    uint8_t src = 0, dst = n - 1;
    Simulator::Schedule(Seconds(4), &Start, src, dst);
    Simulator::Stop(Seconds(6));

    std::cout << "recovery " << g_recovery << ", S is " << Units(Dist(kPositions[src].x * kMetersPerUnit,
                                                                       kPositions[src].y * kMetersPerUnit,
                                                                       kPositions[dst].x * kMetersPerUnit,
                                                                       kPositions[dst].y * kMetersPerUnit))
              << " units from D\n";
    Simulator::Run();
    Simulator::Destroy();
    return 0;
}
