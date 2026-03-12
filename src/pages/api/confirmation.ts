export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { courriel, numero, scrutin } = data;

  if (!courriel || !numero) {
    return new Response(
      JSON.stringify({ error: 'Courriel et numéro requis.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(courriel)) {
    return new Response(
      JSON.stringify({ error: 'Adresse courriel invalide.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const now = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    await resend.emails.send({
      from: 'Votez.com <noreply@votez.com>',
      to: courriel,
      subject: `Confirmation de vote — ${scrutin}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 20px; margin: 0 0 4px;">Confirmation de vote</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0;">${now}</p>
          </div>
          <p style="line-height: 1.6;">Votre vote a été enregistré avec succès. Voici votre numéro de confirmation :</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; margin-bottom: 6px;">Numéro de confirmation</div>
            <div style="font-size: 24px; font-weight: 700; font-family: monospace; color: #0f172a;">${numero}</div>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.6;">Conservez ce courriel pour vos dossiers. Ce numéro vous permettra de confirmer que votre vote a bien été comptabilisé.</p>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Propulsé par Votez.com
          </div>
        </div>
      `,
      text: `Confirmation de vote\n\nVotre vote a été enregistré avec succès.\n\nNuméro de confirmation : ${numero}\n\nConservez ce numéro pour vos dossiers.\n\n— Votez.com`,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'envoi du courriel." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
