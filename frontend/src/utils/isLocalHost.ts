export function isLocalHost(hostname?: string): boolean {
	// If no hostname provided, try to use window.location.hostname in browser env
	const host = hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
	// Matches:
	// - localhost
	// - 127.0.0.1 (and variants)
	// - 10.x.x.x
	// - 192.168.x.x
	// - 172.16.x.x - 172.31.x.x
	const localPattern = /^(localhost|127(?:\.(?:25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})$/;
	return localPattern.test(host);
}
