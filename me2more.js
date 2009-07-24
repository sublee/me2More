/* default limit */
var limit = 3;

/* me2day.notify() via me2day.js */
var notify = notification_message.show_message.bind(notification_message);

var friend_names = [];
var me2more = function(limit) {
    /* check limit */
    if (limit < 1) {
        notify('me2more ERROR: 포스팅 제한수가 1보다 작아서는 안됩니다.');
        return false;
    } else if (!arguments.length) {
        limit = 3;
    }

    /* all posts and comments and also messages */
    var posts = $$('.sec_post');

    /* first posts */
    var heads = posts.filter(function(el) {
        if (el.hasAttribute('id')) {
            return false;
        }
        var name = el.getElementsBySelector('.name_text.alternative a')[0]
                     .innerHTML;
        if (el.getElementsBySelector('.more').length) {
            return false;
        } else if (friend_names.indexOf(name) == -1) {
            friend_names.push(name);
            el.username = name;
            return true;
        } else {
            el.remove();
            return false;
        }
    });

    /* Add `more` section */
    heads.each(function(el) {
        /* messages */
        var messages = {
            more: '더 보기',
            less: '감추기',
            loading: '불러오는 중'
        };

        /* containers */
        var friend_section = new Element('div', {'class': 'friend me2more'});
        var posts_section = new Element('div', {'class': 'posts me2more'});
        var action_section = new Element('div', {
            'class': 'actions me2more effect_box comment_link'
        });

        /* more button */
        var more = new Element('div', {'class': 'more comment rerecom'});
        var more_anchor = new Element('a', {
            href: '/' + el.username + '/me'
        }).update(messages.more);
        more.appendChild(more_anchor);

        /* less button */
        var less = new Element('div', {'class': 'less comment rerecom'}).hide();
        var less_anchor = new Element('a', {href: '#'}).update(messages.less);
        less.appendChild(less_anchor);

        /* implementation of more */
        more_anchor.observe('click', function(e) {
            Event.stop(e);
            new Ajax.Request(this.href, {
                onCreate: function() {
                    more_anchor.update(messages.loading);
                },
                onSuccess: function(t) {
                    var json;
                    try {
                        json = eval('(' + t.responseText + ')');
                    } catch (e) {
                        return;
                    }
                    if (json.result) {
                        var temp = new Element('div');
                        var total_html = json.return_value.html;

                        var regex = {
                            begin: /<div class="post_section[^>]*>/,
                            end: new RegExp(
                                '<div class="entry_comment"[^>]*>'
                                + '<\\/div>\\s*<\\/div>\\s*<\\/div>'
                            )
                        };
                        var html = '', begun = false;
                        var found = {begin: null, end: null};
                        for (var i = 0; i < limit; ++ i) {
                            found.begin = total_html.search(regex.begin);
                            found.end = total_html.search(regex.end);
                            if (!found.end) return;
                            var length = total_html.match(regex.end)[0].length;
                            html += total_html.slice(
                                found.begin, found.end + length
                            ).replace(/no_border/g, '');
                            total_html = total_html.slice(found.end + length);
                        }
                        posts_section.update(html);

                        more.hide();
                        less.show();

                        more_anchor.update(messages.more);
                    } else {
                        more_anchor.update('ERROR');
                        notify('me2more ERROR: ' + json.result);
                    }
                },
                onFailure: function(t) {
                    var json;
                    try {
                        json = eval('(' + t.responseText + ')');
                    } catch (e) {
                        notify('me2more ERROR: ' + json.result);
                    }
                    notify('me2more ERROR: ' + json.result);
                    more_anchor.update(messages.more);
                }
            });
        });

        /* implementation of less */
        less_anchor.observe('click', function(e) {
            Event.stop(e);
            posts_section.getElementsBySelector('.post_section').each(
                function(el, i) {
                    if (i > 0) el.remove();
                    else el.addClassName('no_border');
                }
            );
            less.hide();
            more.show();
        });

        /* append elements */
        var original_post = el.getElementsBySelector('.post_section')[0];

        friend_section.appendChild(posts_section);
        friend_section.appendChild(action_section);

        action_section.appendChild(more);
        action_section.appendChild(less);

        el.appendChild(friend_section);
        posts_section.appendChild(original_post);
    });

    return true;
};

/* 친구들 "더 보기" 시 me2more() 재실행 */
Stream.get_more_posts = function() {
    var elem = $('get_mystream_link');
    if (!this.container_contents) {
        this.container_contents = $('container_contents');
    }
    if (!elem || !this.container_contents) {
        alert('Assert Error');
        return false;
    }
    var old_href = elem.href;
    elem.removeAttribute('href');
    elem.innerHTML = '<img src="/images/indicator_snake.gif" />';
    var on_success = function(t) {
        var json;
        try {
            json = eval('(' + t.responseText + ')');
        } catch (e) {
            return;
        }
        if (json.result) {
            this.container_contents.insert(json.return_value.html);
            elem.setAttribute('href', json.return_value.next_link);
            me2more(limit);
        } else {
            elem.setAttribute('href', old_href);
            notify('더 이상 없습니다.');
        }
        elem.innerHTML = '더보기';
    };
    var on_failure = function(t) {
        notify('글을 가져오지 못했습니다. ' + t.status);
        elem.setAttribute('href', old_href);
        elem.innerHTML = '더보기';
    };
    new Ajax.Request(old_href, {
        asynchronous: true,
        onSuccess: on_success.bind(this),
        onFailure: on_failure.bind(this)
    });
};

if (me2more(limit)) {
    notify('"더 보기"가 부활했습니다.');
}
