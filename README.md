# Description

This is the internal system of Swiftkind. It contains the HR, Payroll, Accounting, and History Systems

## Installation

..after cloning it. (make sure to set a virtualenv or f\*\*k off)

this runs perfectly on `python3.6` so install that version or higher but not lower, OK?

**ON THE BACKEND.**

1. Setup the configuration `settings.py`. PLEASE create a `local_settings.py` and don't play dumb.

2. Don't forget to set `DEBUG` to true in your `local_settings.py`

3. Run `pip install -r requirements.txt`

4. Run `python manage.py migrate` then `runserver`

**TO USE SMTP EMAIL.**

1. Create a dummy google mail account or use existing google mail account

2. Afterwards on your `local_settings.py` add `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` fields

3. Set `EMAIL_HOST_USER` to the account email and `EMAIL_HOST_PASSWORD` to account password 

**ON THE FRONTEND.**

located in (`../<project_root>/assets/scripts/fe/`)

1. Run `npm install` to download and install the dependencies

2. Run `ng build`. If you are going to add changes, add `--watch`


If you want to change the style. This project is using `SASS`

Styling files are located in (`../<project_root>/assets/scripts/fe/src/assets/`)

1. go to the directory path and run `compass watch` (if you are using compass), `sass --watch sass:css` if not.


In-case font-files or images are not found. You need to symlink the files to the backend assets directory. why? go figure.

Backend assets (`../<project_root>/assets/`)
Frontend assets (`../<project_root>/assets/scripts/fe/src/assets/`)

1. to symlink a directory Run `ln -s`

`sudo ln -s <project_root>/assets/scripts/fe/src/assets/fonts/ <project_root>/assets/`
`sudo ln -s <project_root>/assets/scripts/fe/src/assets/images/ <project_root>/assets/`

DO NOT SYMLINK THE WHOLE `ASSETS` directory. (I will fire you **serious face**)

Everything is straightforward so `IF` you still cannot make it to run, please re-visit your programming skills (you might need to).
