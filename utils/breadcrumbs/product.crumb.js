const buildBreadcrumbs = ({ category, product }) => {
    // console.log(category,product);
  const crumbs = [
    { label: "Home", url: "/" },
    { label: "Shop", url: "/shop" },
  ];

  if (category) {
    crumbs.push({
      label: category,
      url: `/shop?category=${encodeURIComponent(category)}`,
    });
  }

  if (product) {
    crumbs.push({ label: product, url: null });
  }

  return crumbs;
};

export default buildBreadcrumbs;
