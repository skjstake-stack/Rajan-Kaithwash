import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
  googleVerificationCode?: string;
}

const DEFAULT_TITLE = 'राजन कैथवास (मंटू) | वैदिक ज्योतिष, जन्म कुंडली, वास्तु एवं हस्तरेखा - छिंदवाड़ा (Parasia)';
const DEFAULT_DESCRIPTION = 'आचार्य राजन कैथवास (मंटू) जी द्वारा प्रामाणिक वैदिक ज्योतिष, जन्म कुंडली फलादेश, कुंडली मिलान, वास्तु परामर्श, हस्तरेखा, अंक ज्योतिष एवं सटीक रत्न परामर्श। छिंदवाड़ा, परासिया, छांदामेटा (मध्य प्रदेश)।';
const DEFAULT_KEYWORDS = 'राजन कैथवास, मंटू, वैदिक ज्योतिष, जन्म कुंडली, कुंडली मिलान, विवाह ज्योतिष, करियर ज्योतिष, वास्तु परामर्श, हस्तरेखा, अंक ज्योतिष, रत्न परामर्श, छिंदवाड़ा ज्योतिष, परासिया ज्योतिष, Chhindwara Astrologer, Rajan Kaithwas Mantoo';
const DEFAULT_OG_IMAGE = 'https://rajankaithwas.com/rajan_kaithwas.svg';
const DEFAULT_CANONICAL = 'https://rajankaithwas.com/';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl = DEFAULT_CANONICAL,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noindex = false,
  googleVerificationCode,
}) => {
  const fullCanonical = canonicalUrl.startsWith('http')
    ? canonicalUrl
    : `https://rajankaithwas.com${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`;

  return (
    <Helmet>
      {/* Title & Description */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="आचार्य राजन कैथवास (मंटू)" />

      {/* Robots Tag */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Google Site Verification */}
      {googleVerificationCode && (
        <meta name="google-site-verification" content={googleVerificationCode} />
      )}

      {/* Open Graph Tags */}
      <meta property="og:site_name" content="राजन कैथवास (मंटू) - वैदिक ज्योतिष एवं आध्यात्मिक केंद्र" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="hi_IN" />

      {/* Twitter Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
