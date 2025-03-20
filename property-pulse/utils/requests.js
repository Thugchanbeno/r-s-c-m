const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;
//fetch all properties
async function fetchProperties() {
  try {
    //Handle the case where the domain is not available yet
    if (!apiDomain) {
      return [];
    }
    const res = await fetch(
      `${apiDomain}/properties`,
      { cache: "no-store" } // Ensures fresh data on every request
    );

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching properties:", error);
    return []; // Return an empty array to prevent crashes
  }
}

//fetch single property
async function fetchProperty(id) {
  try {
    //Handle the case where the domain is not available yet
    if (!apiDomain) {
      return null;
    }
    const res = await fetch(`${apiDomain}/properties/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching properties:", error);
    return null;
  }
}
export { fetchProperties, fetchProperty };
