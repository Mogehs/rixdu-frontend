# Home Data Feature

This feature handles fetching data from Firebase for the home page, including:

- Categories
- Top-level subcategories

## Usage

### 1. Install Redux Toolkit (if not already installed)

```bash
npm install @reduxjs/toolkit react-redux
```

### 2. Use the custom hook in your components

```jsx
import { useHomeData } from '../features/homeData';

const HomePage = () => {
  const { categories, topLevelSubCategories, isLoading, error, loadHomeData } =
    useHomeData();

  // Data automatically fetches on component mount

  // To manually refetch data
  const handleRefresh = () => {
    loadHomeData();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Render categories */}
      <section>
        <h2>Categories</h2>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </section>

      {/* Render top-level subcategories */}
      <section>
        <h2>Popular Categories</h2>
        {topLevelSubCategories.map((subCategory) => (
          <SubCategoryCard key={subCategory.id} subCategory={subCategory} />
        ))}
      </section>
    </div>
  );
};
```

### 3. Structure

- `homeDataSlice.js` - Redux slice with actions and reducer
- `useHomeData.js` - Custom hook for easy data access
- `index.js` - Export file

### 4. Data Flow

1. When a component using `useHomeData()` mounts, the hook dispatches the `fetchHomeData` thunk
2. The thunk calls Firebase to get categories and top-level subcategories
3. On success, data is stored in the Redux store and available to components
4. If needed, data can be manually refreshed using the `loadHomeData()` function
