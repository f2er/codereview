# -*- coding: utf-8 -*-

import os, fnmatch, re, errno, shutil, hashlib, string, sys, time, random

def mkdirs(newdir, mode=0777):
    try: os.makedirs(newdir, mode)
    except OSError, err:
        if err.errno != errno.EEXIST or not os.path.isdir(newdir):  
            raise

def listfiles(root, patterns='*', recurse=1, return_folders=0):        
    pattern_list = patterns.split(';')

    class Bunch:
        def __init__(self, **kwds): self.__dict__.update(kwds)
    arg = Bunch(recurse=recurse, pattern_list=pattern_list,
        return_folders=return_folders, results=[])

    def visit(arg, dirname, files):
        for name in files:
            fullname = os.path.normpath(os.path.join(dirname, name))
            if arg.return_folders or os.path.isfile(fullname):
                for pattern in arg.pattern_list:
                    if fnmatch.fnmatch(name, pattern):
                        arg.results.append(fullname)
                        break
                    
        if not arg.recurse: files[:]=[]

    os.path.walk(root, visit, arg)
    return arg.results

def combo_css(path):
    apps_images = ['common', 'mis']
    for apps_image in apps_images:
        for parent, dirs, files in os.walk(path + '/' + apps_image) :
            for file in files :
                oldpath = parent
                newpath = oldpath.replace(path + '/' + apps_image, path + '/apps')
                if newpath.find('images') < 0 : continue
                if os.path.exists(newpath) != True :
                    mkdirs(newpath)
                shutil.copyfile(oldpath + '/' + file, newpath + '/' + file)
            
    css_files = listfiles(path, '*.css')
    for css in css_files :
        reader = open(css, 'r')
        contents = []
        for line in reader.xreadlines() :
            p = re.compile('@import\s+url.*\([\'\"]?(.+?)[\'\"]?\).*', re.IGNORECASE)
            m = p.match(line)
            if m :
                res_file = m.group(1)
                file_path = os.path.join(os.path.split(css)[0], res_file)
                if os.path.exists(file_path) :
                    file_reader = open(file_path, 'r')
                    content = file_reader.read()
                    contents.append(content)
                else :
                    print 'in file '+ css +', ' + file_path + ' not exists'
            else :
                contents.append(line)

        reader.close()
        
        if(len(contents)) :
            writer = open(css, 'w')
            writer.writelines(contents)
            writer.close()
            print css + ' combo success'

def delete_tmp(path):
    file_exts = ['.py','.bak', '.jar']
    for item in os.listdir(path):
        subpath = os.path.join(path, item)
        if os.path.isdir(subpath):
            if item.startswith('_'):
                shutil.rmtree(subpath, True)
                print 'rmtree ' + subpath
            else:
                delete_tmp(subpath)
        elif os.path.isfile(subpath):
            file_ext = os.path.splitext(subpath)[1]
            if(file_ext in file_exts):
                os.remove(subpath)
                print 'rm ' + subpath

def compress_css(path):
    cssfiles = listfiles(path, '*.css')
    for css in cssfiles:
        #os.popen('java  -jar yuicompressor.jar --charset utf-8 %s --warn --preserve-strings --preserve-semi -o %s' % (css, css))
        print 'yui compress ' + css

def fix_css(path):
    cssfiles = listfiles(path, '*.css')
    for css in cssfiles:
        reader = open(css, 'r')
        content = reader.read()
        if(content.find('screen and') > -1):
            print '%s has screen and, fix it.' % css
            content = content.replace('screen and', ' screen and ')
        if(content.find("src='/resource/css/") > -1):
            print "%s has src='/resource/css/', replace it to absolute url." % css
            content = content.replace("src='/resource/css/", "src='http://st.fanfan.com/css/")
        reader.close()

        #content = content + "/*" + time.strftime('%Y-%m-%d %X', time.localtime(time.time())) + "*/";

        writer = open(css, 'w')
        writer.write(content)
        writer.close();
        
def main():
    path = "../_css/";
    if(os.path.exists(path)):
        shutil.rmtree(path, True)

    shutil.copytree('.', path)
    
    delete_tmp(path)
    combo_css(path)
    compress_css(path)
    fix_css(path)

if __name__ == '__main__':
    main()
