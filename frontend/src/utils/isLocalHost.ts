export function isLocalHost(hostname?: string): boolean {
	// If no hostname provided, try to use window.location.hostname in browser env
	const host = hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
	// Checks for:
	// - localhost
	// - 127.0.0.1 (and variants)
	// - 10.x.x.x
	// - 192.168.x.x
	// - 172.16.x.x - 172.31.x.x

	// Check for "localhost"
	if (host === "localhost") return true;

	// Check for IPv4 addresses
	const ipv4Parts = host.split(".");
	if (ipv4Parts.length === 4 && ipv4Parts.every(part => /^\d+$/.test(part))) {
		const [a, b, _, __] = ipv4Parts.map(Number);
		// 127.0.0.1/8
		if (a === 127) return true;
		// 10.0.0.0/8
		if (a === 10) return true;
		// 192.168.0.0/16
		if (a === 192 && b === 168) return true;
		// 172.16.0.0 - 172.31.255.255
		if (a === 172 && b >= 16 && b <= 31) return true;
	}

	return false;
}
