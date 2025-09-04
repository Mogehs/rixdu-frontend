// Comprehensive subcategories structure for place-ad flow
export const placeAdSubcategories = {
  classifieds: {
    name: 'Classifieds',
    subcategories: {
      electronics: {
        name: 'Electronics',
        subcategories: {
          'mobile-phones': {
            name: 'Mobile Phones',
            isLeaf: true,
          },
          tablets: {
            name: 'Tablets',
            isLeaf: true,
          },
          laptops: {
            name: 'Laptops',
            isLeaf: true,
          },
        },
      },
      furniture: {
        name: 'Furniture',
        isLeaf: true,
      },
    },
  },
  community: {
    name: 'Community',
    subcategories: {
      activities: {
        name: 'Activities',
        isLeaf: true,
      },
      classes: {
        name: 'Classes',
        isLeaf: true,
      },
    },
  },
  events: {
    name: 'Events',
    subcategories: {
      concerts: {
        name: 'Concerts',
        isLeaf: true,
      },
      exhibitions: {
        name: 'Exhibitions',
        isLeaf: true,
      },
    },
  },
  'health-care': {
    name: 'Health & Care',
    subcategories: {
      clinics: {
        name: 'Clinics',
        isLeaf: true,
      },
      pharmacies: {
        name: 'Pharmacies',
        isLeaf: true,
      },
    },
  },
  jobs: {
    name: 'Jobs',
    subcategories: {
      'it-software': {
        name: 'IT & Software',
        isLeaf: true,
      },
      sales: {
        name: 'Sales',
        isLeaf: true,
      },
      healthcare: {
        name: 'Healthcare',
        isLeaf: true,
      },
    },
  },
  motors: {
    name: 'Motors',
    subcategories: {
      cars: {
        name: 'Cars',
        subcategories: {
          luxury: {
            name: 'Luxury Cars',
            isLeaf: true,
          },
          economy: {
            name: 'Economy Cars',
            isLeaf: true,
          },
          sports: {
            name: 'Sports Cars',
            isLeaf: true,
          },
        },
      },
      motorcycles: {
        name: 'Motorcycles',
        subcategories: {
          'sport-bikes': {
            name: 'Sport Bikes',
            isLeaf: true,
          },
          cruisers: {
            name: 'Cruisers',
            isLeaf: true,
          },
        },
      },
      'heavy-vehicles': {
        name: 'Heavy Vehicles',
        subcategories: {
          buses: {
            name: 'Buses',
            subcategories: {
              'city-bus': {
                name: 'City Bus',
                isLeaf: true,
              },
              'school-bus': {
                name: 'School Bus',
                isLeaf: true,
              },
              'tourist-bus': {
                name: 'Tourist Bus',
                isLeaf: true,
              },
            },
          },
          trucks: {
            name: 'Trucks',
            subcategories: {
              'pickup-trucks': {
                name: 'Pickup Trucks',
                isLeaf: true,
              },
              'commercial-trucks': {
                name: 'Commercial Trucks',
                isLeaf: true,
              },
            },
          },
        },
      },
      boats: {
        name: 'Boats',
        subcategories: {
          'fishing-boats': {
            name: 'Fishing Boats',
            isLeaf: true,
          },
          yachts: {
            name: 'Yachts',
            isLeaf: true,
          },
        },
      },
      'parts-accessories': {
        name: 'Parts & Accessories',
        subcategories: {
          'car-parts': {
            name: 'Car Parts',
            isLeaf: true,
          },
          'motorcycle-parts': {
            name: 'Motorcycle Parts',
            isLeaf: true,
          },
        },
      },
    },
  },
  'property-rent': {
    name: 'Property for Rent',
    subcategories: {
      apartments: {
        name: 'Apartments',
        isLeaf: true,
      },
      villas: {
        name: 'Villas',
        isLeaf: true,
      },
      commercial: {
        name: 'Commercial',
        subcategories: {
          offices: {
            name: 'Offices',
            isLeaf: true,
          },
          retail: {
            name: 'Retail',
            isLeaf: true,
          },
        },
      },
    },
  },
  'property-sale': {
    name: 'Property for Sale',
    subcategories: {
      'residential-sale': {
        name: 'Residential',
        subcategories: {
          apartments: {
            name: 'Apartments',
            isLeaf: true,
          },
          villas: {
            name: 'Villas',
            isLeaf: true,
          },
        },
      },
      'commercial-sale': {
        name: 'Commercial',
        isLeaf: true,
      },
    },
  },
};
