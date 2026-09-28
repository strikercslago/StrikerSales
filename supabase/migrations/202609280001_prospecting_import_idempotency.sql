-- Impede que o mesmo retorno de uma busca seja gravado duas vezes, inclusive
-- quando duas requisições chegam quase simultaneamente.
create unique index if not exists lead_batches_owner_prospecting_search_uidx
on public.lead_batches (created_by, (metadata ->> 'prospectingSearchId'))
where metadata ->> 'prospectingSearchId' is not null;

