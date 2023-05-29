import { create } from 'zustand';

interface Store {
	device: 'mobile' | 'desktop';
	setDeviceType: () => void;
}

export const useStore = create<Store>((set) => ({
	device: 'desktop',
	setDeviceType: () => {
		const isMobileOrTable = /iPhone|iPad|iPod|Android/i.test(
			navigator.userAgent
		);
		set({ device: isMobileOrTable ? 'mobile' : 'desktop' });
	},
}));
