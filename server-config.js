(function () {
    "use strict";

    const LOCAL_120_BUILD = "javascript/builds/0.2.0/index.html";

    const PUBLIC_SERVERS = [
        { id: "archmc", name: "ArchMC", addr: "wss://mc.arch.lol/", clients: ["1.8.8", "1.20.4"], preferredBuild: LOCAL_120_BUILD },
        { id: "thanatos", name: "Thanatos Network", addr: "wss://web.thanatos-network.xyz/", clients: ["1.8.8", "1.20.4"], preferredBuild: LOCAL_120_BUILD },
        { id: "clever", name: "Clever Teaching", addr: "wss://clever-teaching.com/", clients: ["1.8.8", "1.20.4"], preferredBuild: LOCAL_120_BUILD },
        { id: "hamburber", name: "HAMBURBER-SMP", addr: "wss://hamburber-smp.eagler.host/", clients: ["1.8.8", "1.20.4"], preferredBuild: LOCAL_120_BUILD }
    ];

    const LOCAL_SERVER = {
        id: "local",
        name: "Local test server",
        addr: "ws://localhost:8081/",
        clients: ["1.8.8", "1.20.4"],
        preferredBuild: LOCAL_120_BUILD
    };

    const RELAYS = [
        { addr: "wss://relay.deev.is/", comment: "lax1dude relay #1" },
        { addr: "wss://relay.lax1dude.net/", comment: "lax1dude relay #2" },
        { addr: "wss://relay.shhnowisnottheti.me/", comment: "ayunami relay #1" }
    ];

    function copyServer(server) {
        return {
            id: server.id,
            name: server.name,
            addr: server.addr,
            clients: server.clients.slice(),
            preferredBuild: server.preferredBuild
        };
    }

    function getServers(options) {
        const includeLocal = options && options.includeLocal;
        const client = options && options.client;
        let servers = includeLocal ? [LOCAL_SERVER].concat(PUBLIC_SERVERS) : PUBLIC_SERVERS.slice();
        if (client) {
            servers = servers.filter(function (server) {
                return server.clients.indexOf(client) !== -1;
            });
        }
        return servers.map(copyServer);
    }

    function getServerById(serverId) {
        const servers = [LOCAL_SERVER].concat(PUBLIC_SERVERS);
        const server = servers.find(function (candidate) {
            return candidate.id === serverId;
        });
        return server ? copyServer(server) : null;
    }

    function getRelays() {
        const primaryIndex = Math.floor(Math.random() * RELAYS.length);
        return RELAYS.map(function (relay, index) {
            return {
                addr: relay.addr,
                comment: relay.comment,
                primary: index === primaryIndex
            };
        });
    }

    function normalizeServerAddress(address) {
        const trimmed = (address || "").trim();
        if (!trimmed) return "";

        if (/^wss?:\/\//i.test(trimmed)) {
            return trimmed;
        }

        if (/^https:\/\//i.test(trimmed)) {
            return "wss://" + trimmed.slice("https://".length);
        }

        if (/^http:\/\//i.test(trimmed)) {
            return "ws://" + trimmed.slice("http://".length);
        }

        return "wss://" + trimmed;
    }

    function getJoinServerFromLocation(locationObject) {
        if (typeof URLSearchParams === "undefined") return "";

        const locationToRead = locationObject || window.location;
        const search = locationToRead && locationToRead.search;
        if (!search || search[0] !== "?") return "";

        const params = new URLSearchParams(search);
        return normalizeServerAddress(params.get("server"));
    }

    function getComparableAddress(address) {
        return normalizeServerAddress(address).replace(/\/+$/, "").toLowerCase();
    }

    function isServerAddressCompatible(address, client) {
        const comparableAddress = getComparableAddress(address);
        if (!comparableAddress) return false;

        const servers = [LOCAL_SERVER].concat(PUBLIC_SERVERS);
        const knownServer = servers.find(function (server) {
            return getComparableAddress(server.addr) === comparableAddress;
        });

        return !knownServer || knownServer.clients.indexOf(client) !== -1;
    }

    window.EaglercraftZServerConfig = {
        getServers: getServers,
        getServerById: getServerById,
        getRelays: getRelays,
        normalizeServerAddress: normalizeServerAddress,
        getJoinServerFromLocation: getJoinServerFromLocation,
        isServerAddressCompatible: isServerAddressCompatible,
        LOCAL_120_BUILD: LOCAL_120_BUILD
    };
}());
