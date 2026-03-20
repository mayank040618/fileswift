export interface BlogPost {
    slug: string;
    title: string;
    metaTitle: string;
    description: string;
    keywords: string[];
    date: string;
    updatedDate: string;
    readingTime: number;
    primaryToolId?: string;
    sections: { heading: string; content: string }[];
    faq: { question: string; answer: string }[];
    whyFileswift: string[];
    relatedSlugs: string[];
}

export const BLOG_POSTS: BlogPost[] = [];

