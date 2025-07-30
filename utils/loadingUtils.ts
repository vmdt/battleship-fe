/**
 * Global loading utilities for managing loading states
 */

/**
 * Add loading state to an element by ID
 * @param elementId - The ID of the element to add loading to
 */
export const setElementLoading = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('loading');
  }
};

/**
 * Remove loading state from an element by ID
 * @param elementId - The ID of the element to remove loading from
 */
export const removeElementLoading = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('loading');
  }
};

/**
 * Add loading state to elements by class name
 * @param className - The class name of elements to add loading to
 */
export const setElementsLoading = (className: string): void => {
  const elements = document.getElementsByClassName(className);
  Array.from(elements).forEach(element => {
    element.classList.add('loading');
  });
};

/**
 * Remove loading state from elements by class name
 * @param className - The class name of elements to remove loading from
 */
export const removeElementsLoading = (className: string): void => {
  const elements = document.getElementsByClassName(className);
  Array.from(elements).forEach(element => {
    element.classList.remove('loading');
  });
};

/**
 * Toggle loading state for an element by ID
 * @param elementId - The ID of the element to toggle loading
 * @param isLoading - Whether to add or remove loading state
 */
export const toggleElementLoading = (elementId: string, isLoading: boolean): void => {
  if (isLoading) {
    setElementLoading(elementId);
  } else {
    removeElementLoading(elementId);
  }
};

/**
 * Toggle loading state for elements by class name
 * @param className - The class name of elements to toggle loading
 * @param isLoading - Whether to add or remove loading state
 */
export const toggleElementsLoading = (className: string, isLoading: boolean): void => {
  if (isLoading) {
    setElementsLoading(className);
  } else {
    removeElementsLoading(className);
  }
};

/**
 * Execute a function with loading state
 * @param elementId - The ID of the element to show loading on
 * @param asyncFunction - The async function to execute
 * @returns Promise with the result of the async function
 */
export const withLoading = async <T>(
  elementId: string, 
  asyncFunction: () => Promise<T>
): Promise<T> => {
  setElementLoading(elementId);
  try {
    const result = await asyncFunction();
    return result;
  } finally {
    removeElementLoading(elementId);
  }
};

/**
 * Execute a function with loading state for multiple elements
 * @param className - The class name of elements to show loading on
 * @param asyncFunction - The async function to execute
 * @returns Promise with the result of the async function
 */
export const withElementsLoading = async <T>(
  className: string, 
  asyncFunction: () => Promise<T>
): Promise<T> => {
  setElementsLoading(className);
  try {
    const result = await asyncFunction();
    return result;
  } finally {
    removeElementsLoading(className);
  }
}; 