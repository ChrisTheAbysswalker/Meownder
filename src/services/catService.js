const API_URL = "https://cataas.com/cat"; // o la URL de tu API de gatos

// obtener un solo gato
export async function fetchCat() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener gato");
    return response.url; // devuelve URL de la imagen
  } catch (err) {
    console.error("fetchCat error:", err);
    return null;
  }
}

// obtener varios gatos
export async function fetchCats(count = 5) {
  try {
    const promises = Array.from({ length: count }, () => fetchCat());
    const cats = await Promise.all(promises);
    return cats.filter(Boolean).map((url) => ({ imageUrl: url }));
  } catch (err) {
    console.error("fetchCats error:", err);
    return [];
  }
}
