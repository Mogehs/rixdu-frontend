import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as BedIcon } from '../../assets/icons/customer.svg';
import { ReactComponent as BathIcon } from '../../assets/icons/notification.svg';
import { ReactComponent as MeasureIcon } from '../../assets/icons/sewing-tape-measure.svg';
import { ReactComponent as LocationIcon } from '../../assets/icons/property-for-sale.svg';
import {
  popularResedential1,
  popularResedential2,
  popularResedential3,
} from '../../assets';
import { propertyCategories, recentPropertyListings } from '../../data/propertyListingData';

// Using imported data
const categories = propertyCategories;
const recentListings = recentPropertyListings;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  @media (max-width: 576px) {
    padding: 0 12px;
  }
`;

const CategoryHeader = styled.div`
  background: linear-gradient(90deg, #033f63 0%, #4c9fd7 100%);
  border-radius: 8px;
  padding: 32px;
  margin: 24px 0;
  color: white;

  @media (max-width: 576px) {
    padding: 24px 16px;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;

  @media (max-width: 576px) {
    font-size: 24px;
    margin-bottom: 16px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 50px;
  width: fit-content;
  overflow: hidden;

  @media (max-width: 400px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Tab = styled.button`
  padding: 8px 24px;
  background: ${(props) => (props.active ? '#1e88e5' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  border-radius: ${(props) => (props.active ? '50px' : '0')};
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.active ? '#1e88e5' : '#f5f5f5')};
  }

  @media (max-width: 400px) {
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
    text-align: center;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 40px 0 24px 0;
  color: #333;

  @media (max-width: 576px) {
    font-size: 20px;
    margin: 32px 0 16px 0;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  @media (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
`;

const CategoryCard = styled(Link)`
  background: white;
  border-radius: 8px;
  padding: 24px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-align: center;
  color: #333;
  font-weight: 500;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 576px) {
    padding: 16px 12px;
    font-size: 14px;
  }
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImage = styled.div`
  height: 180px;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ItemDetails = styled.div`
  padding: 16px;
`;

const ItemTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #212121;
`;

const ItemPrice = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e88e5;
  margin-bottom: 12px;
`;

const ItemFeatures = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;

  @media (max-width: 320px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;

  svg {
    width: 16px;
    height: 16px;
    color: #666;
  }
`;

const ItemLocation = styled.div`
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const VerifiedBadge = styled.span`
  background-color: #e3f2fd;
  color: #1e88e5;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`;

const CategoryPage = () => {
  return (
    <PageContainer>
      <CategoryHeader>
        <HeaderTitle>Categories for Sale</HeaderTitle>
        <TabContainer>
          <Tab active>Sale</Tab>
          <Tab>Rent</Tab>
          <Tab>Off-Plan</Tab>
        </TabContainer>
      </CategoryHeader>

      <SectionTitle>All Category in Property</SectionTitle>
      <CategoryGrid>
        {categories.map((category) => (
          <CategoryCard key={category.id} to={category.path}>
            {category.name}
          </CategoryCard>
        ))}
      </CategoryGrid>

      <SectionTitle>Most Recent Ads</SectionTitle>
      <ListingsGrid>
        {recentListings.map((item) => (
          <ItemCard key={item.id}>
            <ItemImage>
              <img src={item.image} alt={item.title} />
              <VerifiedBadge>Verified</VerifiedBadge>
            </ItemImage>
            <ItemDetails>
              <ItemTitle>{item.title}</ItemTitle>
              <ItemPrice>Price: {item.price}</ItemPrice>
              <ItemFeatures>
                <Feature>
                  <IconContainer>
                    <BedIcon />
                  </IconContainer>
                  <span>{item.beds}</span> bed
                </Feature>
                <Feature>
                  <IconContainer>
                    <BathIcon />
                  </IconContainer>
                  <span>{item.baths}</span> baths
                </Feature>
                <Feature>
                  <IconContainer>
                    <MeasureIcon className='w-4 h-4' />
                  </IconContainer>
                  <span>{item.area}</span> sq.ft
                </Feature>
              </ItemFeatures>
              <ItemLocation>
                <IconContainer>
                  <LocationIcon />
                </IconContainer>
                {item.location}
              </ItemLocation>
            </ItemDetails>
          </ItemCard>
        ))}
      </ListingsGrid>
    </PageContainer>
  );
};

export default CategoryPage;
