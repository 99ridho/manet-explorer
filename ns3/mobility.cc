// Week 5, mobility: random waypoint against group mobility (RPGM) with the visualizer's
// parameters. The script samples positions once a second and reports the protocol-independent
// metrics Week 5 lists (Misra pp. 249-250) and the share of time nodes spend in the centre quarter.
// Run: ./ns3 run "mobility --model=rwp"   or   ./ns3 run "mobility --model=rpgm"

#include "ns3/core-module.h"
#include "ns3/mobility-module.h"
#include "ns3/network-module.h"

#include <iomanip>
#include <iostream>
#include <vector>

using namespace ns3;

// The visualizer's parameters, all demo values: 8 nodes in a 10 x 6 area, range 2.5, speed
// 0.3 to 1.0 units per tick, pause 0 to 2 ticks. One unit is 50 m and one tick is 1 s.
const double kMetersPerUnit = 50;
const double kWidth = 10 * kMetersPerUnit;
const double kHeight = 6 * kMetersPerUnit;
const double kRange = 2.5 * kMetersPerUnit;
const uint32_t kNodes = 8;
const uint32_t kSeconds = 200;

std::vector<std::vector<bool>> g_linked;
std::vector<std::vector<double>> g_since; // when each current link appeared
uint32_t g_changes = 0;
uint32_t g_inCentre = 0;
uint32_t g_samples = 0;
uint32_t g_connectedPairs = 0;
uint32_t g_pairSamples = 0;
double g_closedTotal = 0;
uint32_t g_closed = 0;

void
Sample(NodeContainer nodes)
{
    double now = Simulator::Now().GetSeconds();
    std::vector<Vector> at;
    for (uint32_t i = 0; i < kNodes; i++)
    {
        at.push_back(nodes.Get(i)->GetObject<MobilityModel>()->GetPosition());
        bool centre = at[i].x > kWidth / 4 && at[i].x < 3 * kWidth / 4 && at[i].y > kHeight / 4 &&
                      at[i].y < 3 * kHeight / 4;
        g_inCentre += centre;
        g_samples++;
    }
    for (uint32_t i = 0; i < kNodes; i++)
    {
        for (uint32_t j = i + 1; j < kNodes; j++)
        {
            bool linked = CalculateDistance(at[i], at[j]) <= kRange;
            if (now > 0 && linked != g_linked[i][j])
            {
                g_changes++;
                if (!linked)
                {
                    g_closedTotal += now - g_since[i][j];
                    g_closed++;
                }
            }
            if (linked && !g_linked[i][j])
            {
                g_since[i][j] = now;
            }
            g_linked[i][j] = linked;
        }
    }
    // Which pairs have a path at all: a flood fill over the current links.
    for (uint32_t s = 0; s < kNodes; s++)
    {
        std::vector<bool> reached(kNodes, false);
        std::vector<uint32_t> stack = {s};
        reached[s] = true;
        while (!stack.empty())
        {
            uint32_t v = stack.back();
            stack.pop_back();
            for (uint32_t w = 0; w < kNodes; w++)
            {
                bool link = v < w ? g_linked[v][w] : g_linked[w][v];
                if (w != v && link && !reached[w])
                {
                    reached[w] = true;
                    stack.push_back(w);
                }
            }
        }
        for (uint32_t t = s + 1; t < kNodes; t++)
        {
            g_connectedPairs += reached[t];
            g_pairSamples++;
        }
    }
    if (now < kSeconds)
    {
        Simulator::Schedule(Seconds(1), &Sample, nodes);
    }
}

int
main(int argc, char* argv[])
{
    std::string model = "rwp";
    CommandLine cmd;
    cmd.AddValue("model", "rwp (random waypoint) or rpgm (two groups of four)", model);
    cmd.Parse(argc, argv);
    RngSeedManager::SetSeed(5);

    NodeContainer nodes;
    nodes.Create(kNodes);
    std::string speed = "ns3::UniformRandomVariable[Min=" + std::to_string(0.3 * kMetersPerUnit) +
                        "|Max=" + std::to_string(1.0 * kMetersPerUnit) + "]";
    if (model == "rwp")
    {
        Ptr<RandomRectanglePositionAllocator> area = CreateObject<RandomRectanglePositionAllocator>();
        area->SetAttribute("X", StringValue("ns3::UniformRandomVariable[Min=0|Max=" + std::to_string(kWidth) + "]"));
        area->SetAttribute("Y", StringValue("ns3::UniformRandomVariable[Min=0|Max=" + std::to_string(kHeight) + "]"));
        MobilityHelper mobility;
        mobility.SetPositionAllocator(area);
        mobility.SetMobilityModel("ns3::RandomWaypointMobilityModel",
                                  "Speed", StringValue(speed),
                                  "Pause", StringValue("ns3::UniformRandomVariable[Min=0|Max=2]"),
                                  "PositionAllocator", PointerValue(area));
        mobility.Install(nodes);
    }
    else
    {
        // Each group's reference point walks the four corners, one unit per tick, group 2 starting
        // at the opposite corner (Misra 10.3.2). A member moves around its reference point by
        // random waypoint without pauses inside a disc of radius 1 unit.
        std::vector<Vector> corners = {{0, 0, 0}, {kWidth, 0, 0}, {kWidth, kHeight, 0}, {0, kHeight, 0}};
        for (uint32_t g = 0; g < 2; g++)
        {
            Ptr<WaypointMobilityModel> reference = CreateObject<WaypointMobilityModel>();
            double t = 0;
            for (uint32_t lap = 0; t < kSeconds; lap++)
            {
                for (uint32_t c = 0; c < 4; c++)
                {
                    Vector from = corners[(c + 2 * g) % 4];
                    reference->AddWaypoint(Waypoint(Seconds(t), from));
                    t += CalculateDistance(from, corners[(c + 1 + 2 * g) % 4]) / kMetersPerUnit;
                }
            }
            Ptr<RandomDiscPositionAllocator> disc = CreateObject<RandomDiscPositionAllocator>();
            disc->SetAttribute("Rho", StringValue("ns3::UniformRandomVariable[Min=0|Max=" +
                                                  std::to_string(kMetersPerUnit) + "]"));
            for (uint32_t m = 0; m < 4; m++)
            {
                Ptr<RandomWaypointMobilityModel> member = CreateObject<RandomWaypointMobilityModel>();
                member->SetAttribute("Speed", StringValue(speed));
                member->SetAttribute("Pause", StringValue("ns3::ConstantRandomVariable[Constant=0]"));
                member->SetAttribute("PositionAllocator", PointerValue(disc));
                Ptr<HierarchicalMobilityModel> h = CreateObject<HierarchicalMobilityModel>();
                h->SetParent(reference);
                h->SetChild(member);
                nodes.Get(4 * g + m)->AggregateObject(h);
            }
        }
    }

    g_linked.assign(kNodes, std::vector<bool>(kNodes, false));
    g_since.assign(kNodes, std::vector<double>(kNodes, 0));
    Simulator::Schedule(Seconds(0), &Sample, nodes);
    Simulator::Stop(Seconds(kSeconds + 0.5));
    Simulator::Run();

    std::cout << std::fixed << std::setprecision(1);
    std::cout << "model " << model << ", seed 5, " << kSeconds << " s sampled once a second\n";
    std::cout << "links appeared or broke " << g_changes << " times\n";
    if (g_closed > 0)
    {
        std::cout << "a link lasted " << g_closedTotal / g_closed << " s on average\n";
    }
    else
    {
        std::cout << "no link broke\n";
    }
    std::cout << 100.0 * g_connectedPairs / g_pairSamples << " % of node pairs had a path\n";
    std::cout << 100.0 * g_inCentre / g_samples << " % of node time was in the centre quarter\n";
    Simulator::Destroy();
    return 0;
}
