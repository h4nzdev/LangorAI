import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Langor AI',
    short_name:       'Langor',
    description:      'AI-powered language tutor with real-time voice interaction and instant feedback.',
    start_url:        '/dashboard',
    display:          'standalone',
    background_color: '#09090b',
    theme_color:      '#8b5cf6',
    orientation:      'portrait',
    categories:       ['education', 'productivity'],
    icons: [
      {
        src:     '/icons/icon-72x72.png',
        sizes:   '72x72',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-144x144.png',
        sizes:   '144x144',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-192x192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/icons/icon-512x512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src:          '/icons/icon-512x512.png',
        sizes:        '512x512',
        type:         'image/png',
        // @ts-ignore — 'form_factor' is valid in the spec but not yet in TS types
        form_factor:  'narrow',
        label:        'Langor AI Dashboard',
      },
    ],
  };
}
