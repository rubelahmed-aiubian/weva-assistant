class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async fetchCategories(locale) {
    try {
      const response = await fetch(`${this.baseUrl}/section`, {
        headers: {
          Requestlocale: locale,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const categories = await response.json();
      // Filter and return categories with data
      const categoriesWithData = await Promise.all(
        categories.map(async (category) => {
          const data = await this.fetchCategoryData(category.id);
          return data.stores && data.stores.length > 0 ? category : null;
        })
      );
      return categoriesWithData.filter(Boolean);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async fetchCategoryData(categoryId, locale) {
    try {
      const response = await fetch(`${this.baseUrl}/home/${categoryId}`, {
        headers: {
          Requestlocale: locale,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch category data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching category data:", error);
      throw error;
    }
  }

  async fetchCenterData(storeId, locale) {
    try {
      const response = await fetch(`${this.baseUrl}/center/${storeId}`, {
        headers: {
          Requestlocale: locale,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch center data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching center data:", error);
      throw error;
    }
  }

  async fetchServicesForDepartment(centerId, departmentId, locale) {
    try {
      const response = await fetch(`${this.baseUrl}/center/${centerId}`, {
        headers: {
          Requestlocale: locale,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      return data.services
        .filter((service) => service.department_ids.includes(departmentId))
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  }
}

// Create a singleton instance of the service
const apiService = new ApiService("https://weva.live/api/v3");
export default apiService;
