import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Invisible component: generates a random first-party visitor ID (stored in
// localStorage) and a per-tab session ID (sessionStorage), then fires a single
// trackLandingVisit request. No fingerprinting, no PII sent. Fire-and-forget —
// never blocks landing-page rendering.

export default function FunnelTracker() {
  useEffect(() => {
    try {
      // Visitor ID — persists across sessions (first-party, random, not a fingerprint)
      let visitorId = localStorage.getItem('transbill_visitor_id');
      if (!visitorId) {
        visitorId = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
        localStorage.setItem('transbill_visitor_id', visitorId);
      }

      // Session ID — new per tab/session
      let sessionId = sessionStorage.getItem('transbill_session_id');
      if (!sessionId) {
        sessionId = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
        sessionStorage.setItem('transbill_session_id', sessionId);
      }

      // UTM params from URL
      const params = new URLSearchParams(window.location.search);
      const source = params.get('utm_source') || '';
      const medium = params.get('utm_medium') || '';
      const campaign = params.get('utm_campaign') || '';

      // Fire and forget — never blocks, never surfaces errors to the user
      base44.functions.invoke('trackLandingVisit', { visitor_id: visitorId, session_id: sessionId, source, medium, campaign })
        .catch(() => {});
    } catch {
      // Silently ignore — analytics must never break the landing page
    }
  }, []);

  return null;
}