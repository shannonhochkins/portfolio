import styled from '@emotion/styled';

interface CardProps {
  children: React.ReactNode;
  href: string;
}

const Glass = styled.div`
  position: absolute;
  z-index: 1;
  opacity: 0.4;
  filter: blur(10px);
  transform: translateY(10px) scale(1.25);
`;

const StyledCard = styled.a`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;

  & img {
    width: 50%;
    height: 50%;
    border-radius: 50%;
  }

`;

export default function Card({ children, href }: CardProps) {
  return (
    <StyledCard href={href}>
      <Glass />
      {children}
    </StyledCard>
  );
}
