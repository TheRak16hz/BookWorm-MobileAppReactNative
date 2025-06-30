// this function convert the createdAt to this format: "May 2023"
export function formatMemberSince(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString('es-ES', { month: 'long' }); // Ej: "junio"
  const year = date.getFullYear();
  return `${capitalize(month)} ${year}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


//this funtion will convert the createdAt to this format: "May 15, 2023"
export function formatPublishedDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

// this function will convert the createdAt to this format: "May 15, 2023"