# Changelog

## 1.5.0
 * added selection of deep properties in the data asset types
 * improvements to the url handling of for the assets for additional built-in providers (s3, ftp)

## 1.4.0
 * Aded FTP upload/download support for assets and action-upload

## 1.2.0
 * added @nexrender/action-upload
 * added result S3 upload support

## 1.1.0
 * added --reuse flag
 * fixed issue with same projects being picked up by differnt workers

## 1.0.3
 * added ability to override worker polling settings
 * fixed percentage calculation

## 1.0.2
 * added ability to override api polling settings

## 1.0.1
 * fixed issues with encoding

## 1.0.0
Biggest update since first version has been released

 * project has been rewritten, it now consists of multiple packages
 * a conceptually new way of dealing with after effects has been introduced
 * new structures for jobs, allowing more developer friedly way of adding new features
 * full documentation/readme rewrite

## v0.6.0
 * added ability to use s3 file type as asset, details: https://github.com/inlife/nexrender/pull/61

## v0.5.0
 * added files ability to use local rendernode-side files

## v0.4.8 - v0.4.12
 * added ability to setup local renderning with single rendernode
 * improved program interface
 * bug fixes

## v0.4.4 - v0.4.7
 * JPEG sequence rendering
 * updated dependencies
 * removed actions from renderer
 * project model can be now used without api

## v0.4
Testing era

* renderer covered with tests
* improved error handling

## v0.3
Renderer perfomance

* added options to renderer
* added more settings to project
* added auto-patchning

## v0.2
Dynamic projects

* added patcher task
* project can be asset
* improved error handling

## v0.1
Initial release

* added basic renderer
* added api server
* added api client
* added cli interface
* project named: **nexrender**
