import styled from '@emotion/styled';

interface CardProps {
  children: React.ReactNode;
}

const Glass = styled.div`
  position: absolute;
  z-index: 1;
  opacity: 0.4;
  filter: blur(10px);
  transform: translateY(10px) scale(1.25);
`;
const Img = styled.img`
  position: relative;
  z-index: 0;
`;

const StyledCard = styled.span`
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

export default function Card({ children }: CardProps) {
  return (
    <StyledCard>
      <Glass />
      {children}
    </StyledCard>
  );
}
