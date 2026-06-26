(function () {
    "use strict";

    const PUBLIC_SERVERS = [
        { id: "archmc", name: "ArchMC", addr: "wss://mc.arch.lol/" },
        { id: "thanatos", name: "Thanatos Network", addr: "wss://web.thanatos-network.xyz/" },
        { id: "clever", name: "Clever Teaching", addr: "wss://clever-teaching.com/" },
        { id: "hamburber", name: "HAMBURBER-SMP", addr: "wss://hamburber-smp.eagler.host/" }
    ];

    const LOCAL_SERVER = { id: "local", name: "Local test server", addr: "ws://localhost:8081/" };

    const RELAYS = [
        { addr: "wss://relay.deev.is/", comment: "lax1dude relay #1" },
        { addr: "wss://relay.lax1dude.net/", comment: "lax1dude relay #2" },
        { addr: "wss://relay.shhnowisnottheti.me/", comment: "ayunami relay #1" }
    ];

    function copyServer(server) {
        return {
            id: server.id,
            name: server.name,
            addr: server.addr
        };
    }

    function getServers(options) {
        const includeLocal = options && options.includeLocal;
        const servers = includeLocal ? [LOCAL_SERVER].concat(PUBLIC_SERVERS) : PUBLIC_SERVERS;
        return servers.map(copyServer);
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

    window.EaglercraftZServerConfig = {
        getServers: getServers,
        getRelays: getRelays,
        normalizeServerAddress: normalizeServerAddress,
        getJoinServerFromLocation: getJoinServerFromLocation
    };
}());
