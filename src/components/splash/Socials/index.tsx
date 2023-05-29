import Card from './components/Card';
import Dock from './components/Dock';
import DockCard from './components/DockCard';
import { ReactComponent as Email } from './assets/email.svg';
import { ReactComponent as LinkedIn } from './assets/linkedIn.svg';
import { ReactComponent as GitHub } from './assets/github.svg';

interface Socials {
	name: string;
	child: React.ReactNode;
	href: string;
}

const SOCIALS: Socials[] = [
	{
		name: 'GitHub',
		child: <GitHub />,
		href: 'https://github.com/shannonhochkins/',
	},
	{
		name: 'LinkedIn',
		child: <LinkedIn />,
		href: 'https://www.linkedin.com/in/shannonhochkins/',
	},
	{
		name: 'Email',
		child: <Email />,
		href: 'mailto:mail@shannonhochkins.com',
	},
];

export default function Socials() {
	return (
		<Dock>
			{SOCIALS.map(({ name, child, href }) => (
				<DockCard key={name}>
					<Card href={href}>{child}</Card>
				</DockCard>
			))}
		</Dock>
	);
}
