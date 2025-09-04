# Store and Category APIs - Complete Documentation

## Base URL

```
https://your-api-domain.com/api/v1
```

## Authentication

- **Admin Required**: Some endpoints require admin authentication
- **Bearer Token**: Include in Authorization header: `Authorization: Bearer <token>`

---

# Store APIs

## 1. Create Store

**POST** `/stores`

### Headers

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)

```
name: string (required) - Store name
icon: file (optional) - Store icon image
```

### Response

**Success (201)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b123c4567890abcdef12",
    "name": "Electronics Store",
    "slug": "electronics-store",
    "icon": {
      "url": "https://cloudinary.../icon.jpg",
      "public_id": "stores/icons/abc123"
    },
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
}
```

**Error (400)**

```json
{
  "success": false,
  "message": "A store with this name already exists"
}
```

---

## 2. Get All Stores

**GET** `/stores`

### Query Parameters

```
level: number (optional) - Fetch categories up to this level for all stores
root: boolean (optional) - If "true", returns tree structure of categories
```

### Response Examples

#### Basic Store List

**GET** `/stores`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f8b123c4567890abcdef12",
      "name": "Electronics Store",
      "slug": "electronics-store",
      "icon": {
        "url": "https://cloudinary.../icon.jpg",
        "public_id": "stores/icons/abc123"
      }
    },
    {
      "_id": "64f8b123c4567890abcdef13",
      "name": "Fashion Store",
      "slug": "fashion-store",
      "icon": null
    }
  ]
}
```

#### With Categories by Level

**GET** `/stores?level=1`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "64f8b123c4567890abcdef12",
      "name": "Electronics Store",
      "slug": "electronics-store",
      "icon": {
        "url": "https://cloudinary.../icon.jpg",
        "public_id": "stores/icons/abc123"
      },
      "categories": [
        {
          "_id": "64f8b456c4567890abcdef14",
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "icon": {...},
          "isLeaf": false,
          "childrenCount": 3,
          "level": 0,
          "parent": null
        },
        {
          "_id": "64f8b456c4567890abcdef15",
          "name": "Laptops",
          "slug": "laptops",
          "icon": {...},
          "isLeaf": false,
          "childrenCount": 2,
          "level": 0,
          "parent": null
        }
      ],
      "categoryLevel": 1,
      "categoryCount": 2
    }
  ],
  "categoryLevel": 1
}
```

#### With Root Tree Structure

**GET** `/stores?root=true`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "64f8b123c4567890abcdef12",
      "name": "Electronics Store",
      "slug": "electronics-store",
      "icon": {...},
      "categories": [
        {
          "_id": "64f8b456c4567890abcdef14",
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "icon": {...},
          "isLeaf": false,
          "childrenCount": 2,
          "level": 0,
          "parent": null,
          "children": [
            {
              "_id": "64f8b456c4567890abcdef16",
              "name": "Android",
              "slug": "android",
              "icon": {...},
              "isLeaf": true,
              "childrenCount": 0,
              "level": 1,
              "parent": "64f8b456c4567890abcdef14",
              "children": []
            }
          ]
        }
      ],
      "isRootRequest": true,
      "categoryCount": 3
    }
  ],
  "isRootRequest": true
}
```

---

## 3. Get Single Store

**GET** `/stores/{idOrSlug}`

### Parameters

```
idOrSlug: string (required) - Store ID or slug
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b123c4567890abcdef12",
    "name": "Electronics Store",
    "slug": "electronics-store",
    "icon": {
      "url": "https://cloudinary.../icon.jpg",
      "public_id": "stores/icons/abc123"
    },
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
}
```

**Error (404)**

```json
{
  "success": false,
  "message": "Store not found"
}
```

---

## 4. Update Store

**PUT** `/stores/{idOrSlug}`

### Headers

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)

```
name: string (optional) - New store name
icon: file (optional) - New store icon
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b123c4567890abcdef12",
    "name": "Updated Electronics Store",
    "slug": "updated-electronics-store",
    "icon": {
      "url": "https://cloudinary.../new-icon.jpg",
      "public_id": "stores/icons/xyz789"
    },
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T12:45:00.000Z"
  },
  "iconUpdated": true
}
```

---

## 5. Delete Store

**DELETE** `/stores/{idOrSlug}`

### Headers

```
Authorization: Bearer <admin_token>
```

### Response

**Success (200)**

```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

**Error (400) - Store has categories**

```json
{
  "success": false,
  "message": "Cannot delete store with existing categories",
  "data": {
    "categoriesCount": 5
  }
}
```

---

# Category APIs

## 1. Create Category

**POST** `/categories`

### Headers

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)

```
storeId: string (required) - Store ObjectId
name: string (required) - Category name
parent: string (optional) - Parent category ObjectId
isLeaf: boolean (optional, default: false) - Whether category is a leaf node
fields: string (optional) - JSON array of field definitions for leaf categories
icon: file (optional) - Category icon image
```

### Example Fields for Leaf Category

```json
[
  {
    "name": "title",
    "type": "input",
    "required": true
  },
  {
    "name": "description",
    "type": "text",
    "required": true
  },
  {
    "name": "price",
    "type": "number",
    "required": true
  },
  {
    "name": "condition",
    "type": "select",
    "options": ["new", "used", "refurbished"],
    "required": true
  },
  {
    "name": "images",
    "type": "file",
    "multiple": true,
    "maxFiles": 10,
    "minFiles": 1,
    "required": true
  }
]
```

### Response

**Success (201)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b456c4567890abcdef14",
    "storeId": "64f8b123c4567890abcdef12",
    "name": "Mobile Phones",
    "slug": "mobile-phones",
    "parent": null,
    "isLeaf": false,
    "fields": [],
    "icon": {
      "url": "https://cloudinary.../category-icon.jpg",
      "public_id": "categories/icons/def456"
    },
    "level": 0,
    "path": "",
    "childrenCount": 0,
    "children": [],
    "createdAt": "2023-09-06T11:00:00.000Z",
    "updatedAt": "2023-09-06T11:00:00.000Z"
  }
}
```

---

## 2. Get Categories

**GET** `/categories`

### Query Parameters

```
storeId: string (optional) - Store ID or slug to filter by
parent: string (optional) - Parent category ID ("null" for root categories)
page: number (optional, default: 1) - Page number
limit: number (optional, default: 50) - Items per page
```

### Response Examples

#### Get Root Categories for a Store

**GET** `/categories?storeId=electronics-store&parent=null`

```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "pagination": {
    "page": 1,
    "pages": 1,
    "limit": 50
  },
  "data": [
    {
      "_id": "64f8b456c4567890abcdef14",
      "name": "Mobile Phones",
      "slug": "mobile-phones",
      "icon": {...},
      "isLeaf": false,
      "childrenCount": 3,
      "level": 0
    },
    {
      "_id": "64f8b456c4567890abcdef15",
      "name": "Laptops",
      "slug": "laptops",
      "icon": {...},
      "isLeaf": false,
      "childrenCount": 2,
      "level": 0
    }
  ]
}
```

#### Get Child Categories

**GET** `/categories?parent=64f8b456c4567890abcdef14`

```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "pagination": {
    "page": 1,
    "pages": 1,
    "limit": 50
  },
  "data": [
    {
      "_id": "64f8b456c4567890abcdef16",
      "name": "Android",
      "slug": "android",
      "icon": {...},
      "isLeaf": true,
      "childrenCount": 0,
      "level": 1
    },
    {
      "_id": "64f8b456c4567890abcdef17",
      "name": "iPhone",
      "slug": "iphone",
      "icon": {...},
      "isLeaf": true,
      "childrenCount": 0,
      "level": 1
    }
  ]
}
```

---

## 3. Get Single Category

**GET** `/categories/{identifier}`

### Parameters

```
identifier: string (required) - Category ID or slug
```

### Query Parameters

```
storeId: string (optional) - Store ID for additional filtering
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b456c4567890abcdef16",
    "storeId": "64f8b123c4567890abcdef12",
    "name": "Android",
    "slug": "android",
    "parent": "64f8b456c4567890abcdef14",
    "isLeaf": true,
    "fields": [
      {
        "name": "title",
        "type": "input",
        "required": true
      },
      {
        "name": "description",
        "type": "text",
        "required": true
      },
      {
        "name": "price",
        "type": "number",
        "required": true
      },
      {
        "name": "files",
        "type": "file",
        "required": true,
        "multiple": true,
        "maxFiles": 12,
        "minFiles": 1
      },
      {
        "name": "location",
        "type": "point",
        "required": true
      }
    ],
    "icon": {...},
    "level": 1,
    "path": "64f8b456c4567890abcdef14",
    "childrenCount": 0,
    "children": [],
    "createdAt": "2023-09-06T11:15:00.000Z",
    "updatedAt": "2023-09-06T11:15:00.000Z",
    "childrenData": []
  }
}
```

---

## 4. Update Category

**PUT** `/categories/{identifier}`

### Headers

```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)

```
name: string (optional) - New category name
isLeaf: boolean (optional) - Whether category is a leaf node
fields: string (optional) - JSON array of field definitions
icon: file (optional) - New category icon
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b456c4567890abcdef16",
    "storeId": "64f8b123c4567890abcdef12",
    "name": "Android Phones",
    "slug": "android-phones",
    "parent": "64f8b456c4567890abcdef14",
    "isLeaf": true,
    "fields": [...],
    "icon": {...},
    "level": 1,
    "path": "64f8b456c4567890abcdef14",
    "childrenCount": 0,
    "children": [],
    "updatedAt": "2023-09-06T13:30:00.000Z"
  }
}
```

---

## 5. Delete Category

**DELETE** `/categories/{identifier}`

### Headers

```
Authorization: Bearer <admin_token>
```

### Response

**Success (200)**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error (400) - Has subcategories**

```json
{
  "success": false,
  "message": "Cannot delete a category that has subcategories. Delete subcategories first."
}
```

---

## 6. Get Category Tree

**GET** `/categories/store/{storeId}/tree`

### Parameters

```
storeId: string (required) - Store ObjectId
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8b456c4567890abcdef14",
      "name": "Mobile Phones",
      "slug": "mobile-phones",
      "isLeaf": false,
      "fields": [],
      "icon": {...},
      "children": [
        {
          "_id": "64f8b456c4567890abcdef16",
          "name": "Android",
          "slug": "android",
          "isLeaf": true,
          "fields": [...],
          "icon": {...},
          "children": []
        },
        {
          "_id": "64f8b456c4567890abcdef17",
          "name": "iPhone",
          "slug": "iphone",
          "isLeaf": true,
          "fields": [...],
          "icon": {...},
          "children": []
        }
      ]
    }
  ]
}
```

---

## 7. Get Category Path

**GET** `/categories/path/{identifier}`

### Parameters

```
identifier: string (required) - Category ID, slug, or name
```

### Response

**Success (200)**

```json
{
  "success": true,
  "storeId": "64f8b123c4567890abcdef12",
  "data": [
    {
      "_id": "64f8b456c4567890abcdef14",
      "name": "Mobile Phones",
      "slug": "mobile-phones",
      "storeId": "64f8b123c4567890abcdef12"
    },
    {
      "_id": "64f8b456c4567890abcdef16",
      "name": "Android",
      "slug": "android",
      "storeId": "64f8b123c4567890abcdef12"
    }
  ]
}
```

---

## 8. Get Categories by Store

**GET** `/categories/store/{storeId}`

### Parameters

```
storeId: string (required) - Store ObjectId
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "count": 5,
    "categories": [
      {
        "_id": "64f8b456c4567890abcdef14",
        "storeId": "64f8b123c4567890abcdef12",
        "name": "Mobile Phones",
        "slug": "mobile-phones",
        "parent": null,
        "isLeaf": false,
        "level": 0,
        "childrenCount": 2
      }
      // ... more categories
    ]
  }
}
```

---

## 9. Get Category by Slug

**GET** `/categories/slug/{slug}`

### Parameters

```
slug: string (required) - Category slug
```

### Query Parameters

```
storeId: string (optional) - Store ID for additional filtering
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "_id": "64f8b456c4567890abcdef16",
    "storeId": "64f8b123c4567890abcdef12",
    "name": "Android",
    "slug": "android",
    "parent": "64f8b456c4567890abcdef14",
    "isLeaf": true,
    "fields": [...],
    "icon": {...},
    "level": 1,
    "path": "64f8b456c4567890abcdef14",
    "childrenCount": 0,
    "children": [],
    "childrenData": []
  }
}
```

---

## 10. Search Categories

**GET** `/categories/search`

### Query Parameters

```
q: string (optional) - Search query for name or slug
storeSlug: string (optional) - Store slug to filter by
isLeaf: boolean (optional) - Filter by leaf categories
level: number (optional) - Filter by category level
parent: string (optional) - Filter by parent ID ("null" for root)
page: number (optional, default: 1) - Page number
limit: number (optional, default: 20) - Items per page
```

### Response Examples

#### Search by Query

**GET** `/categories/search?q=phone&storeSlug=electronics-store`

```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "pagination": {
    "page": 1,
    "pages": 1,
    "limit": 20
  },
  "data": [
    {
      "_id": "64f8b456c4567890abcdef14",
      "name": "Mobile Phones",
      "slug": "mobile-phones",
      "icon": {...},
      "isLeaf": false,
      "childrenCount": 2,
      "level": 0,
      "path": "",
      "storeId": "64f8b123c4567890abcdef12"
    },
    {
      "_id": "64f8b456c4567890abcdef18",
      "name": "Phone Accessories",
      "slug": "phone-accessories",
      "icon": {...},
      "isLeaf": true,
      "childrenCount": 0,
      "level": 1,
      "path": "64f8b456c4567890abcdef14",
      "storeId": "64f8b123c4567890abcdef12"
    }
  ]
}
```

#### Filter Leaf Categories

**GET** `/categories/search?isLeaf=true&storeSlug=electronics-store`

```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "pagination": {
    "page": 1,
    "pages": 1,
    "limit": 20
  },
  "data": [
    {
      "_id": "64f8b456c4567890abcdef16",
      "name": "Android",
      "slug": "android",
      "icon": {...},
      "isLeaf": true,
      "childrenCount": 0,
      "level": 1,
      "path": "64f8b456c4567890abcdef14",
      "storeId": "64f8b123c4567890abcdef12"
    }
    // ... more leaf categories
  ]
}
```

---

## 11. Get Category Children

**GET** `/categories/slug/{slug}/children`

### Parameters

```
slug: string (required) - Parent category slug
```

### Query Parameters

```
storeId: string (optional) - Store ID
page: number (optional, default: 1) - Page number
limit: number (optional, default: 50) - Items per page
```

### Response

**Success (200)**

```json
{
  "success": true,
  "parentCategory": {
    "_id": "64f8b456c4567890abcdef14",
    "name": "Mobile Phones",
    "slug": "mobile-phones"
  },
  "count": 2,
  "total": 2,
  "pagination": {
    "page": 1,
    "pages": 1,
    "limit": 50
  },
  "data": [
    {
      "_id": "64f8b456c4567890abcdef16",
      "name": "Android",
      "slug": "android",
      "icon": {...},
      "isLeaf": true,
      "childrenCount": 0,
      "level": 1
    },
    {
      "_id": "64f8b456c4567890abcdef17",
      "name": "iPhone",
      "slug": "iphone",
      "icon": {...},
      "isLeaf": true,
      "childrenCount": 0,
      "level": 1
    }
  ]
}
```

---

# Field Types for Leaf Categories

When creating leaf categories, you can define custom fields using these types:

## Field Type Reference

```json
{
  "name": "field_name",
  "type": "field_type",
  "required": boolean,
  "options": ["option1", "option2"], // for select/radio types
  "multiple": boolean, // for file types
  "maxSize": number, // for file types (bytes)
  "maxFiles": number, // for file types
  "minFiles": number, // for file types
  "accept": string // for file types (mime types)
}
```

### Available Field Types:

- **text**: Multi-line text input
- **input**: Single-line text input
- **number**: Numeric input
- **select**: Dropdown selection
- **radio**: Radio button selection
- **checkbox**: Checkbox input
- **date**: Date picker
- **file**: File upload
- **point**: Location/GPS coordinates

---

# Error Response Format

All API endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Common HTTP Status Codes:

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Internal server error

---

# Usage Examples for Flutter

## Initialize API Client

```dart
class ApiClient {
  static const String baseUrl = 'https://your-api-domain.com/api/v1';
  static const String authToken = 'your_bearer_token';

  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $authToken',
  };
}
```

## Get Stores with Categories

```dart
Future<List<Store>> getStoresWithCategories() async {
  final response = await http.get(
    Uri.parse('${ApiClient.baseUrl}/stores?root=true'),
    headers: ApiClient.headers,
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((store) => Store.fromJson(store))
        .toList();
  }
  throw Exception('Failed to load stores');
}
```

## Search Categories

```dart
Future<List<Category>> searchCategories({
  String? query,
  String? storeSlug,
  bool? isLeaf,
  int page = 1,
}) async {
  final queryParams = <String, String>{
    'page': page.toString(),
    if (query != null) 'q': query,
    if (storeSlug != null) 'storeSlug': storeSlug,
    if (isLeaf != null) 'isLeaf': isLeaf.toString(),
  };

  final uri = Uri.parse('${ApiClient.baseUrl}/categories/search')
      .replace(queryParameters: queryParams);

  final response = await http.get(uri, headers: ApiClient.headers);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((category) => Category.fromJson(category))
        .toList();
  }
  throw Exception('Failed to search categories');
}
```

This comprehensive documentation covers all the Store and Category API endpoints with detailed request/response examples, error handling, and Flutter usage examples for your development team.
