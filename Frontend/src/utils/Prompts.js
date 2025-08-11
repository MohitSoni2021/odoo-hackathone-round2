export const getStateDetails = (state) => {
    return `
  You are an expert HTML + Tailwind CSS developer.  
  The name of the place is ${state}.  
  Return only the JSX structure for a responsive React component page describing that place.  
  Requirements:  
  - Use Tailwind CSS for all styling.  
  - Include sections: Hero image with overlay title, About section, Tourist Attractions in a responsive grid, Best Time to Visit, and How to Reach.  
  - Use relevant royalty-free Unsplash images.  
  - Do not fetch data dynamically; make it static.  
  - Return only the JSX code inside a single parent <div>.  
  - Do not include import/export statements, comments, markdown formatting, or any text outside the JSX.
  `;
  };
  