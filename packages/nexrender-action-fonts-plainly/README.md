# Action: Fonts Plainly

Module that allows installing and uninstall fonts as pre-render and post-render actions...

Works on Windows and OSX.

```json
"actions": {
  "prerender": [
    {
      "module": "@nexrender/action-fonts-plainly",
      "action": "install",
      "fonts": ["My Font.otf"]
    }
  ]
}
```

## Set Windows Permissions

### Windows Fonts Folder Permissions

1. Run cmd as an admin and call following commands:

```batch
attrib -r -s "c:\windows\fonts"
takeown /f "c:\windows\fonts"
icacls "c:\windows\fonts" /t /grant "authenticated users":(OI)(CI)F
```

1. Right click on `c:\windows\fonts` folder
1. Go to `Security` tab
1. Click `Edit`
1. Select `Users (...)`, check `Full control` and click `OK`

### Windows Fonts Registry Permissions

1. Run `regedit` from cmd
1. Go to `HKEY_LOCAL_MACHINE\SOFTWARE\MICROSOFT\WINDOWS NT\CURRENT VERSION\FONTS`
1. Right click on `Fonts` -> `Permissions...`
1. Select `Users (...)`, check `Full control` and click `OK`
1. Restart windows
