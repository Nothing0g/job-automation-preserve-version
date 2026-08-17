# Google Sheets Import Architecture

The initial importer will accept a Google Sheets URL and a tab name, then fetch a CSV representation through the Google Visualization endpoint. The source sheet must be shared so that anyone with the link can view it. Private Sheets require end-user Google authorization and are intentionally outside this first version, because the requested scope only requires import by URL and sheet name.

The importer will only accept `docs.google.com/spreadsheets` URLs, extract the spreadsheet identifier, and request the selected tab as CSV. It will not run scheduled synchronization, scrape external job listings, send emails, or access a Google account. Column mapping will support the four requested fields: Company, Role, Job Description, and Status.

Sources consulted: Google for Developers, “Google Spreadsheets” (notes that Visualization API access to private Sheets requires end-user credentials, whereas link-viewable Sheets do not); Apify Academy, “Scraping a list of URLs from a Google Sheets document” (illustrates a `/gviz/tq?tqx=out:csv` public export URL).
