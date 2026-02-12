export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    fbq: any;
  }
}

export const pageview = () => {
  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  } else {
    console.warn("Meta Pixel: fbq is not defined");
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options: any = {}) => {
  if (typeof window.fbq === "function") {
    window.fbq("track", name, options);
  } else {
    console.warn("Meta Pixel: fbq is not defined");
  }
};
