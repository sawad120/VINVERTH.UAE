/* =====================================
   VINVERTH PRODUCT CATALOGUE
   Edit the image URLs, names, and prices here.
   The catalogue exposes 97 products after excluding every VN-1095 item.
   ===================================== */
(function createVinverthCatalogue() {
  const menImages = [
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785596127/Gemini_Generated_Image_t79ocmt79ocmt79o_wrgmfo.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595978/Gemini_Generated_Image_wwz6cjwwz6cjwwz6_vjchx5.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595842/Gemini_Generated_Image_t6zvjmt6zvjmt6zv_sbjqmu.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595803/Gemini_Generated_Image_5syaf55syaf55sya_anoxcw.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595770/Gemini_Generated_Image_qeu4cqeu4cqeu4cq_q5inof.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595738/Gemini_Generated_Image_wfpd7ewfpd7ewfpd_rjcvvt.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595701/Gemini_Generated_Image_4f1uyw4f1uyw4f1u_fwrfun.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595617/Gemini_Generated_Image_jy4j4jjy4j4jjy4j_hz2gic.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595579/Gemini_Generated_Image_92v7fk92v7fk92v7_dkez4d.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595531/Gemini_Generated_Image_x8amadx8amadx8am_n2xs5z.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595500/Gemini_Generated_Image_robcc2robcc2robc_nqalud.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595292/Gemini_Generated_Image_9bx64w9bx64w9bx6_u3r2hv.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595241/Gemini_Generated_Image_km5n5gkm5n5gkm5n_zsjlwu.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595061/Gemini_Generated_Image_9o7mrw9o7mrw9o7m_h4h7sb.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594869/Gemini_Generated_Image_5luv0n5luv0n5luv_eriplx.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594806/Gemini_Generated_Image_3sr0kg3sr0kg3sr0_tlx3yk.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594772/Gemini_Generated_Image_zbaypmzbaypmzbay_yib05f.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594670/Gemini_Generated_Image_hrqznghrqznghrqz_vq4kp4.png"
  ];

  const womenImages = [
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594718/Gemini_Generated_Image_rh4oocrh4oocrh4o_dwjnqf.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594837/Gemini_Generated_Image_km4oarkm4oarkm4o_ubkg6e.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594903/Gemini_Generated_Image_vhyofevhyofevhyo_vmhrou.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785594991/Gemini_Generated_Image_gu421rgu421rgu42_jvqrrm.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595014/Gemini_Generated_Image_q47051q47051q470_uskbcl.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595135/Gemini_Generated_Image_fl8qxjfl8qxjfl8q_dcifjh.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595171/Gemini_Generated_Image_67e5a567e5a567e5_ispauo.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595203/Gemini_Generated_Image_k16qbuk16qbuk16q_dntsss.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595334/Gemini_Generated_Image_tbmbtctbmbtctbmb_iq8qwa.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595377/Gemini_Generated_Image_eza7g5eza7g5eza7_hrdygo.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595409/Gemini_Generated_Image_7tdf5a7tdf5a7tdf_epng33.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595453/Gemini_Generated_Image_g6r1bqg6r1bqg6r1_ynfj63.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595662/Gemini_Generated_Image_72dds172dds172dd_zjjx7m.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595872/Gemini_Generated_Image_ynpqdsynpqdsynpq_fxvihw.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595913/Gemini_Generated_Image_34if3p34if3p34if_bpydck.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785595945/Gemini_Generated_Image_425oxy425oxy425o_l3z02c.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785596014/Gemini_Generated_Image_las5cclas5cclas5_olcfwg.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785596070/Gemini_Generated_Image_fmzkmvfmzkmvfmzk_fjp0ih.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785596167/Gemini_Generated_Image_tldqs5tldqs5tldq_fnnqpk.png"
  ];

  const menNames = [
    "VN-1091", "VN-1092", "VN-1093", "VN-1094", "VN-1095", "VN-1096", "VN-1097", "VN-1098", "VN-1099",
    "VN-1100", "VN-1101", "VN-1102", "VN-1103", "VN-1104", "VN-1105", "VN-1106", "VN-1107", "VN-1108"
  ];

  const womenNames = [
    "VN-1202", "VN-1203", "VN-1204", "VN-1205", "VN-1206", "VN-1207", "VN-1208", "VN-1209", "VN-1210",
    "VN-1211", "VN-1212", "VN-1213", "VN-1214", "VN-1215", "VN-1216", "VN-1217", "VN-1218", "VN-1219", "VN-1220"
  ];

  const premiumImages = [
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785655153/vin_s92g8s.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785655201/d5668652-5f02-4a5e-a7cc-8815ff563fa6_tdxgl2.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785655685/b70f6188-d28e-4d8d-a968-ed4aaaaea202_zkspvt.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785655783/5a9fa261-7f7d-4085-9cce-50e29e9c794e_uoqsr6.png",
    "https://res.cloudinary.com/davogn4xk/image/upload/v1785655923/1f121e1c-cfe7-45bd-a3ce-7576a5a3e5eb_akzlpi.png"
  ];

  const premiumDescriptions = [
    "Yellow-tinted lenses built for better contrast, reduced glare, and a confident premium finish.",
    "A stylish purple transparent frame with a polished premium finish, perfect for everyday fashion.",
    "A sleek green transparent frame with dark lenses, designed for comfort, durability, and everyday style.",
    "Luxury eyewear with a refined silhouette, designed to elevate every occasion.",
    "Premium black frames with gradient smoke lenses for a sleek, polished finish."
  ];

  const menDescriptions = [
    "Slim black rectangular frame with a clean bridge and a discreet blue-light-ready finish.",
    "Bold black square frame with a balanced brow and quietly confident structure.",
    "Translucent slate frame with softened corners for a modern architectural look.",
    "Deep green angular frame with dark lenses for a sharp, outdoors-ready statement.",
    "Crystal-clear oversized frame that keeps the silhouette light and expressive.",
    "Smoky blue frame with a softly textured finish and an easy everyday shape.",
    "Deep navy rectangular frame with a strong browline and polished finish.",
    "Classic black rectangular frame with crisp lines for a dependable daily rotation.",
    "Black-to-plum rounded frame with tinted lenses and a relaxed weekend attitude.",
    "Refined dark frame with a streamlined profile that adds quiet character to any look.",
    "Warm yellow-tinted lenses in a compact black frame for contrast and a playful retro edge.",
    "Lightweight clear-grey rectangle with a fine bridge for understated, airy styling.",
    "Pale transparent rectangular frame with a polished edge and quiet clarity.",
    "Minimal black frame with a fine profile that slips easily into everyday tailoring.",
    "Clean-lined frame with a subtle finish for a polished look that never feels overdone.",
    "Champagne-gold aviator with softly tinted lenses for a classic, sunlit finish.",
    "Gold metal aviator with deep green lenses for a confident vintage-inspired look.",
    "Rich blue square frame with a clean glossy finish and modern depth."
  ];

  const womenDescriptions = [
    "Slim dark round sunglasses with a delicate bridge and an effortless city-ready mood.",
    "Soft rose transparent frame with a graceful shape and a polished feminine finish.",
    "Polished black frame with a lifted corner for a subtle, confident cat-eye effect.",
    "Clear oversized frame with a luminous finish and beautifully balanced proportions.",
    "Fine gold oval frame that brings a warm, lightweight touch to everyday styling.",
    "Minimal silver round frame with an airy profile and timeless optical character.",
    "Warm tortoiseshell sunglasses with softly rounded lenses for an easy classic feel.",
    "Crystal-clear angular frame that feels modern, light, and quietly distinctive.",
    "Pale crystal rectangular frame with a refined silhouette and delicate visual weight.",
    "Soft pink transparent frame designed to add a gentle pop of color without overpowering the look.",
    "Barely-there crystal frame with slender lines for an elegant everyday finish.",
    "Bold black frame with a sculpted brow for a confident, fashion-forward profile.",
    "Playful berry-blue translucent frame with soft color contrast and a contemporary shape.",
    "Vivid violet transparent square frame that turns a clean silhouette into a statement.",
    "Dark tortoise rectangular sunglasses with a polished finish and timeless appeal.",
    "Sculptural black square frame with strong proportions and a sleek modern presence.",
    "Lilac transparent frame with slim lines and a light, graceful everyday feel.",
    "Blush pink oversized frame with soft corners for an expressive, polished look.",
    "Fine warm-metal frame with a delicate profile that keeps the finish effortlessly refined."
  ];

  const imagePool = [...premiumImages, ...menImages, ...womenImages];

  const categories = ["Sunglasses", "Optical"];
  const genders = ["Men", "Women",];

  const products = Array.from({ length: 100 }, (_, index) => {
    const category = categories[index % categories.length];
    const gender = genders[index % genders.length];
    const isTitanium = category === "Sunglasses";
    const price = isTitanium ? 210 : 152;
    const isPremium = index < premiumImages.length;
    const isNew = index < 12 || index % 11 === 0;
    const collectionIndex = Math.floor(index / genders.length);
    const collectionImages = gender === "Men" ? menImages : womenImages;
    const collectionNames = gender === "Men" ? menNames : womenNames;
    return {
      id: `VX-${String(5001 + index)}`,
      name: collectionNames[collectionIndex % collectionNames.length],
      category,
      gender,
      image: isPremium ? premiumImages[index] : collectionImages[collectionIndex % collectionImages.length],
      price,
      oldPrice: index % 4 === 0 ? (isTitanium ? 245 : 180) : null,
      badge: isPremium ? "Premium" : isNew ? "New" : index % 7 === 0 ? "Bestseller" : "",
      description: isPremium ? premiumDescriptions[index] : (gender === "Men" ? menDescriptions : womenDescriptions)[collectionIndex % (gender === "Men" ? menDescriptions.length : womenDescriptions.length)],
      uv: category === "Sunglasses" ? "UV 400 protection" : "Blue light ready",
      material: isTitanium ? "Titanium" : "Optical acetate",
      size: index % 2 === 0 ? "Medium fit · 52–18–140" : "Universal fit · 50–20–140",
      createdAt: 100 - index,
      stock: index % 17 === 0 ? "Low stock" : "In stock"
    };
  });

  const availableProducts = products.filter((product) => product.name !== "VN-1095");

  window.VinverthProducts = {
    products: availableProducts,
    featured: availableProducts.slice(0, 12),
    imagePool
  };
})();
