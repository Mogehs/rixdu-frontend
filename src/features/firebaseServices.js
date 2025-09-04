import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const fetchSubCategories = async({ collectionName, parentId }) => {
    try {
        // Create a reference to the subcategories collection
        const subCategoriesRef = collection(
            db,
            collectionName,
            parentId,
            'subCategories'
        );

        // Get documents from the subcategories collection
        const querySnapshot = await getDocs(subCategoriesRef);

        const subCategories = [];
        querySnapshot.forEach((doc) => {
            subCategories.push({
                ...doc.data(),
            });
        });

        return subCategories;
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
    }
};

const fetchCategoriesAds = async({ categoryName }) => {
    try {
        const collectionRef = collection(db, 'Listings', categoryName, 'Ads');
        const querySnapshot = await getDocs(collectionRef);
        const subCategories = [];
        querySnapshot.forEach((doc) => {
            subCategories.push({
                ...doc.data(),
            });
        });

        return subCategories;
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw error;
    }
};

export { fetchSubCategories, fetchCategoriesAds };