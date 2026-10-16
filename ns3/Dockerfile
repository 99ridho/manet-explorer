# The ns-3 build that checks every script in this folder and captures the output the app shows.
# Run it through scripts/ns3-check.sh, not by hand.
FROM ubuntu:24.04
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      g++ cmake ninja-build python3 git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ARG NS3_TAG=ns-3.49
RUN git clone --depth 1 --branch ${NS3_TAG} https://gitlab.com/nsnam/ns-3-dev.git /ns-3
WORKDIR /ns-3
RUN ./ns3 configure -d optimized -G Ninja --disable-examples --disable-tests \
      --enable-modules="wifi;internet;internet-apps;applications;mobility;aodv;dsdv;dsr;olsr;flow-monitor;energy" \
    && ./ns3 build
