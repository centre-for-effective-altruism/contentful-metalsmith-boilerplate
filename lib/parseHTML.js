var MarkdownIt = require('markdown-it')
var MarkdownItAttrs = require('markdown-it-attrs')
// var MarkdownItFootnote = require('markdown-it-footnote');
// var MarkdownItRegExp = require('markdown-it-regexp')
// var MarkdownItSub = require('markdown-it-sub');
// var MarkdownItSup = require('markdown-it-sup');
var cheerio = require('cheerio');
var typogr = require('typogr');
var url = require('url');

exports.parse = function(html,meta,options) {
    if(!html || html.toString().length === '') return '';
    // collection = typeof collection === 'string' ? [collection] : collection || [];
    var md = new MarkdownIt()
    .use(MarkdownItAttrs)
    // .use(MarkdownItFootnote)
    ;

    html = md.render( html );
    // use Cheerio to modify HTML
    var $ = cheerio.load(html);
    // styling for first paragraphs on blog posts/pages
    
    $('p').first().addClass('first-paragraph')

    $('img').each(function(){
        console.log('Image:');
        var img = $(this);
        // ensure contentful URLs use HTTPS protocol
        var imgUrl = url.parse(img.attr('src'));
        console.log(imgUrl.hostname);

        // wrap images that are in p tags in figures instead
        var parent = img.parent();
        if(parent[0] && parent[0].name === 'p'){
            parent.replaceWith(function(){
                var figcaption = $('<figcaption />')
                    .append( $(this).contents().clone() )
                figcaption.find('img').remove()
                if(figcaption.text().length<=0){
                    figcaption = '';
                }
                return $('<div class="row" />')
                    .append($('<div class="col-xs-12" />')
                        .append($('<figure />')
                            .append(img)
                            .append(figcaption)
                        )
                    )
            })
        }
        // add img-responsive tags to images
        img.addClass('img-responsive');
    })

    // add a heading to our footnotes
    $('section.footnotes').prepend('<h2 class="footnotes-title">Footnotes</h2>');


    $('table').each(function(){
        var table = $(this);
        // add bootstrap styles to tables
        table.replaceWith(function(){
            return $('<div class="container" />').append($('<table class="table table-striped" />').append($(this).contents()))
        })
    })


    // add legal-style numbers to each heading on certain content types
    if(meta && meta.collection && 
        (meta.collection.indexOf('_reports')>-1 || meta.slug === "frequently-asked-questions")
    ){
        var headingIndex = [0,0,0,0,0,0,0];
        $('h2,h3,h4,h5,h6').each(function(){
            var heading = $(this);
            var tag = heading[0].name;
            var level = parseInt(tag.charAt(1))
            headingIndex[level+1] = 0;
            headingIndex[level]++;
            var index = headingIndex.slice(2,level+1)
            heading.prepend("<span class='index'>"+index.join('.')+". </span>")
            heading.addClass('indexed')
        })
    }

    html = $.html();
    
    // typogr
    html = typogr.typogrify(html)

    // sanitise shortcodes
    html = html.replace(/(<p.*?>.*?|.*?)(\[)(.*?)(\])(.*?<\/p>|.*?)/gim,function(match,openingTag,openingShortcode,shortCodeParams,closingShortcode,closingTag){
        shortCodeParams = shortCodeParams.replace(/<.*?>.*?<\/.*>/g,' ').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/(&nbsp;|&#xA0;)/g,' ')
        var useOuterTags = openingTag.search(/<p.*>$/)===-1;
        var output = (useOuterTags ? openingTag : '') + openingShortcode+shortCodeParams+closingShortcode + (useOuterTags ? closingTag : '')
        return output;
    })

    // save back to the main metalsmith array
    return html;

} 