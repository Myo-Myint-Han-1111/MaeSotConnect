import React from 'react';

interface OrganizationStructuredDataProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    locality: string;
    country: string;
  };
}

export function OrganizationStructuredData({ name, url, logo, description, address }: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    ...(address && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": address.locality,
        "addressCountry": address.country
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CourseStructuredDataProps {
  name: string;
  description: string;
  provider: string;
  url: string;
  startDate?: string;
  duration?: string;
  location?: string;
  fee?: string;
  images?: string[];
}

export function CourseStructuredData({ 
  name, 
  description, 
  provider, 
  url, 
  startDate, 
  duration, 
  location, 
  fee, 
  images 
}: CourseStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider
    },
    "url": url,
    ...(startDate && { "startDate": startDate }),
    ...(duration && { "duration": duration }),
    ...(location && { "location": location }),
    ...(fee && { "offers": {
      "@type": "Offer",
      "price": fee,
      "priceCurrency": "THB"
    }}),
    ...(images && images.length > 0 && { "image": images })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface WebsiteStructuredDataProps {
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    type: string;
    target: string;
    query: string;
  };
}

export function WebsiteStructuredData({ name, url, description, potentialAction }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    ...(potentialAction && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": potentialAction.target,
        "query-input": potentialAction.query
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}