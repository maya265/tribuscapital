# Adding a new client to the portal

Do these steps in order, in the Supabase dashboard, for every new client.

1. **Authentication → Users → Invite user** — enter the client's email.
   Supabase emails them a link to set their own password.
2. **Table Editor → `profiles`** — a row for the new user already exists
   (created automatically). Open it and fill in `full_name`, `phone`,
   `national_id`.
3. **Table Editor → `loans`** — Insert row: pick `client_id` from the
   dropdown, fill `loan_number`, `loan_type`, `principal_amount`, `status`,
   `start_date`.
4. **Storage → `loan-documents` bucket** — upload the file(s) into a folder
   named `<client_id>/<loan_id>/` (create the folder if it doesn't exist).
5. **Table Editor → `loan_documents`** — Insert row: pick `loan_id`, set a
   readable `title` (e.g. "חוזה הלוואה חתום"), and set `storage_path` to
   **exactly** match the path used in step 4, including the filename
   (e.g. `a1b2.../c3d4.../contract.pdf`). A mismatched path here is the most
   common mistake — it silently breaks the client's download.
6. Log in as the client (or a test account) once to confirm everything
   shows up correctly before considering it done.
