**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
# Transbill Digital Marketing & Workforce Development Programme

This application manages applications, pre-screening, selection interviews and applicant status for the free two-week Lagos programme supported by Lagos Innovates | LSETF.

## Required deployment secrets

Configure these values in the Base44 deployment environment before opening applications:

- `APP_DOMAIN`: the public application origin, for example `https://jobs.transbill.ng`.
- `ASSESSMENT_SIGNING_SECRET`: a random value of at least 32 characters used to sign each applicant's randomised assessment attempt. Generate it once and keep it private.
- `ADMIN_PASSWORD`: the administrator credential used by the existing admin functions.
- `GOOGLE_SHEET_ID`: the destination spreadsheet used for application exports.
- `LASRRA_VERIFICATION_URL`: the authorised LASRRA/LSETF verification endpoint.
- `LASRRA_API_KEY`: the credential issued for that verification service.

The application intentionally fails closed when `ASSESSMENT_SIGNING_SECRET` is missing or too short.
