const suffix = process.env.NEXT_PUBLIC_DEV_SUFFIX ? `-${process.env.NEXT_PUBLIC_DEV_SUFFIX}` : "";

export const repos = {
    data: `lurkhub-data${suffix}`,
    posts: `lurkhub-posts${suffix}`,
};
