var whipEnabled = true;
(function($, sm) {
   var jpTerminal = (function() {
      var env = {
             active: null,
             accessAttempts: 0,
             maxIndex: 1,
             musicOn: false,
             commands: {},
             sounds: {},
             volume: 0.15,
             commandArr: [],
             commandNum: 0
          };
      var api = {};

      api.ComStackNum = function( ){
          return env.commandNum;
      }
      api.ComStackArr = function( ){
          return env.commandArr;
      }
      api.ComStackInc = function( ){
          env.commandNum = env.commandNum + 1;
      }
      api.ComStackDec = function( ){
          env.commandNum = env.commandNum - 1;
      }
      api.ComStackReset = function( ){
          env.commandNum = 0;
      }
      api.buildCommandLine = function(line) {
         var commandName = line.trim().split(/ /)[0];
         var command = env.commands[commandName] && env.commands[commandName].command;

         env.active.find('.command-history')
                   .append($('<div class="entered-command">')
                   .text('> ' + line));

         env.commandArr.push(line);
         if (command) {
            command(env, line);
         } else if (commandName) {
            env.active.find('.command-history')
                      .append($('<div>').text(commandName + ': command not found'));
         }
      }

      api.addCommand = function(details) {
         if (details.name && !env.commands.hasOwnProperty(details.name) && (details.command.constructor === Function)) {
            env.commands[details.name] = details;
         }
      }

      api.whip = function(){
          env.sounds.whip.play();
      }

      api.setActive = function(active) {
         env.active = $(active) || env.active;
      }

      api.getActive = function() {
         return env.active;
      }

      api.nextIndex = function() {
         return ++env.maxIndex;
      }

      api.init = function() {
         // HTML5 audio element detection
         if (!(Modernizr.audio.mp3 || Modernizr.audio.wav || Modernizr.audio.ogg)) {
             console.log("Your Browser does not support HTML5 Sound");
         }
			var whipHTML5 = $('<audio preload="auto"/>');
            var fourTwentyHTML5 = $('<audio preload="auto"/>');

			whipHTML5.append('<source src="/snd/whipcrack.mp3">');
            fourTwentyHTML5.append('<source src="/snd/420.mp3">');

			env.sounds.whip = {
				play: function() {
					whipHTML5[0].load();
					whipHTML5[0].play();
				}
			};

            env.sounds.fourTwenty = {
                play: function() {
                    fourTwentyHTML5[0].load();
                    fourTwentyHTML5[0].play();
                    fourTwentyHTML5[0].volume = env.volume;
					fourTwentyHTML5[0].playbackRate = 0.9;
					fourTwentyHTML5[0].webkitPreservesPitch = false;
                },
                stop: function() {
                    fourTwentyHTML5[0].pause();
                }
            };

            fourTwentyHTML5.bind('ended', function() {
               env.sounds.fourTwenty.play();
            });

             // XD
             env.sounds.fourTwenty.play();
             env.musicOn = true;
      }

      return api;
   }());

   jpTerminal.init();
   jpTerminal.setActive('#main-terminal');

   jpTerminal.addCommand({
	   name: 'whip',
	   summary: 'whip',
	   manPage: 'whip',
	   command: function(env, inputLine) {
			env.sounds.whip.play();
	   }
   });
   
   jpTerminal.addCommand({
      name: 'music',
      summary: 'turn background music on or off',
      manPage: 'SYNOPSIS\n' + 
               '\tmusic [on|off]\n\n' + 
               'DESCRIPTION\n' + 
               '\tManage the state of the music.(On/Off)\n' +
               'AUTHOR\n' +
               '\tWritten by <a href="https://tully.io">Tully Robinson</a>.\n',
      command: function(env, inputLine) {
         var arg = inputLine.trim().split(/ +/)[1] || '';
         var output = $('<span/>').text('music: must specify state [on|off]');

         if (!arg || !arg.match(/^(?:on|off)$/i)) {
            $('#main-input').append(output);
         } else {
            if (arg.toLowerCase() === 'on') {
               if (!env.musicOn) {
                  env.sounds.fourTwenty.play();
               }
               env.musicOn = true;
            } else if (arg.toLowerCase() === 'off') {
               env.sounds.fourTwenty.stop();
               env.musicOn = false;
            }
         }
      }
   });
    jpTerminal.addCommand({
        name: 'volume',
        summary: 'set music volume',
        manPage: 'It\'s a Volume command, dumbass. [usage: volume xx 0.0->1.0]',
        command: function(env, inputLine) {
            var arg = inputLine.trim().split(' ')[1] || '';
            var output = $('<span/>').text('volume: must set volume level');
            if (!arg) {
                $('#main-input').append(output);
            } else {
                if( arg > 1 || arg < 0 ){
                    $('#main-input').append('Argument must be between 0.0 and 1.0!')
                    return;
                }
                if( env.musicOn ){
                    env.sounds.fourTwenty.stop();
                    env.volume = arg;
                    env.sounds.fourTwenty.play();
                } else {
                    env.volume = arg;
                }
            }
        }
    });

   jpTerminal.addCommand({
    name: 'access', 
      summary: 'access a target environment on the Jurassic Systems grid',
      manPage: 'SYNOPSIS\n' +
               '\taccess [SYSTEM_NAME] [MAGIC_WORD]\n\n' +
               'DESCRIPTION\n' + 
               '\tGain read and write access to a specified environment.\n\n' +
               'AUTHOR\n' +
               '\tWritten by Dennis Nedry.\n',
      command: function(env, inputLine) {
          var output = $('<span>').text('access: PERMISSION DENIED');
          var arg = inputLine.split(/ +/)[1] || '';
          var magicWord = inputLine.substring(inputLine.trim()
                                   .lastIndexOf(' ')) || '';

         if (arg === '') {
            $('#main-input').append($('<span/>')
                            .text('access: must specify target system'));

            return;
         } else if (inputLine.split(' ').length > 2 && magicWord.trim() === 'please') {
            $('#asciiNewman').load(function() {
               var wrap = $('.inner-wrap', env.active);
               wrap.scrollTop(wrap[0].scrollHeight);
            });

            return;
         }

         $('#main-input').append(output);
         env.sounds.beep.play();

         if (++env.accessAttempts >= 3) {
            var andMessage = $('<span>').text('...and....');
            var errorSpam;

            $('.irix-window').unbind('keydown');
            $('#main-prompt').addClass('hide');

            setTimeout(function() {
               $('#main-input').append(andMessage);
            }, 200);

            setTimeout(function() {
               env.sounds.lockDown.play();
            }, 1000);

            setTimeout(function() {
               $('#environment').animate({
                  'left': '+=3000'
               },
               2000,
               function() {
                  setTimeout(function() {
                     $('#irix-desktop').hide();
                     if (errorSpam) {
                        clearInterval(errorSpam);
                     }

                  }, 2000);
               });
            }, 4000);

            setTimeout(function() {
               errorSpam = setInterval(function() {
                  var errorMessage = $('<div>YOU DIDN\'T SAY THE MAGIC WORD!</div>');
                  $('#main-input').append(errorMessage);
                  $('#main-inner').scrollTop($('#main-inner')[0].scrollHeight);
               }, 50);
            }, 1000);
         }
      }
   });

   jpTerminal.addCommand({
      name: 'system',
      summary: 'check a system\'s current status',
      manPage: 'SYNOPSIS\n' +
               '\tsystem [SYSTEM_NAME]\n\n' +
               'DESCRIPTION\n' +
               '\tCheck the input system and return each sector\'s current status.\n\n' +
               'AUTHOR\n' +
               '\tWritten by Dennis Nedry.\n',
      command: function(env, inputLine) {
         var arg = inputLine.split(/ +/)[1] || '';
         var output = '<span>system: must specify target system</span>';

         if (arg.length > 0) {
            arg = arg.replace(/s$/, '');
            arg = arg[0].toUpperCase() + arg.slice(1);
            arg = $('<div/>').text(arg).html();
            
            output = '<div>' + arg + ' containment enclosure....</div>' +
                     '<table id="system-output"><tbody>' +
                     '<tr><td>Security</td><td>[OK]</td></tr>' +
                     '<tr><td>Fence</td><td>[OK]</td></tr>' +
                     '<tr><td>Feeding Pavilion</td><td>[OK]</td></tr>' +
                     '</tbody></table>';

            $('#main-prompt').addClass('hide');
            $('#main-input').append($(output));
            output = '<div>System Halt!</div>';
            env.sounds.beep.play();

            setTimeout(function() {
               var wrap = $('.inner-wrap', env.active);
               env.sounds.beep.play();
               $('#main-input').append($(output));
               wrap.scrollTop(wrap[0].scrollHeight);
               $('#main-prompt').removeClass('hide');
            }, 900);
         } else {
            $('#main-input').append($(output));
         }
      }
   });

   jpTerminal.addCommand({
      name: 'ls',
      summary: 'list files in the current directory',
      manPage: 'SYNOPSIS\n' + 
               '\tls [FILE] ...\n\n' +
               'DESCRIPTION\n' + 
               '\tList information about the FILEs (the current directory by default).\n\n' +
               'AUTHOR\n' +
               '\tWritten by Richard Stallman and David MacKenzie.\n',
      command: function(env, inputLine) {
         $('#main-input').append($('<div>waifu.jpg</div>'));
      }
   });

    jpTerminal.addCommand({
        name: 'quake',
        summary: 'Launch the Quake 3 Video game ',
        manPage: 'SYNOPSIS\n' +
        '\tquake \n\n' +
        'DESCRIPTION\n' +
        '\tLaunches Quake 3 \n\n' +
        'AUTHOR\n' +
        '\tWritten by Id Software and QuakeJS.\n',
        command: function(env, inputLine) {
            $('#quake').css('z-index', ++env.maxIndex);
            $('#quake').show();

            if( env.musicOn ){
                env.sounds.fourTwenty.stop();
            }
            function getQueryCommands() {
                var search = /([^&=]+)/g;
                var query  = window.location.search.substring(1);

                var args = [];

                var match;
                while (match = search.exec(query)) {
                    var val = decodeURIComponent(match[1]);
                    val = val.split(' ');
                    val[0] = '+' + val[0];
                    args.push.apply(args, val);
                }

                return args;
            }
            function resizeViewport() {
                if (!ioq3.canvas) {
                    // ignore if the canvas hasn't yet initialized
                    return;
                }
                if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
                    document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
                    document['fullScreenElement'] || document['fullscreenElement'])) {
                    // ignore resize events due to going fullscreen
                    return;
                }
                ioq3.setCanvasSize(ioq3.viewport.offsetWidth, ioq3.viewport.offsetHeight);
            }

            ioq3.viewport = document.getElementById('viewport-frame');
            ioq3.elementPointerLock = true;
            ioq3.exitHandler = function (err) {
                if (err) {
                    var form = document.createElement('form');
                    form.setAttribute('method', 'POST');
                    form.setAttribute('action', '/');

                    var hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', 'error');
                    hiddenField.setAttribute('value', err);
                    form.appendChild(hiddenField);

                    document.body.appendChild(form);
                    form.submit();
                    return;
                }

                window.location.href = '/';
            }

            window.addEventListener('resize', resizeViewport);

            var names = ['Stinky Pete', 'Dirty Dan', 'Curly Joe', 'Rude JoAnn', 'Greedy Greg', 'Rich Schlomo', 'Genius Pajeet', // adj-name
                            'X', 'B-A-Z-I-N-G-A', 'Cake is a lie XD', 'Edshot Macheen', 'Edgy Username', 'Sickfedoras Champ', 'Eugene', // random ones
                            'Paul Wall', 'HyperVoid', 'Fr0zenF1re',
                            'Haruko-chan', 'Sagagami-chan', 'Megumi-chan', 'Rei-chan', 'Kirito-Kun', 'Naruto-San', 'Akiyama-chan', 'Goku-sama', // weeb shit
                            'Nagato-sensei', '0richim4ru'
            ];
            // merge default args with query string args
            var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950', '+connect', 'quakejs.sickfedoras.com:27960',
                '+name', names[ Math.floor( Math.random() * names.length) ] ];
            args.push.apply(args, getQueryCommands());
            whipEnabled = false;
            ioq3.callMain(args);
        }
    });


    jpTerminal.addCommand({
      name: 'display',
      summary: 'display image files (hint: use ls to find a \'file\')',
      manPage: 'SYNOPSIS\n' +
               '\tdisplay file ...\n\n' +
               'DESCRIPTION\n' +
               '\tDisplay is a machine architecture independent image processing and display\n\tprogram. It can <strong>display</strong> an image on any workstation screen running an X server.\n\n' +
               'AUTHOR\n' +
               '\tJohn Cristy, ImageMagick Studio.\n',
      command: function(env, inputLine) {
         var args = inputLine.trim().split(' ');

         if (args.length < 2) {
            $('#main-input').append($('<span>display: no file specified</span>'));
            return;
         }

         if (inputLine.match(/waifu\.jpg/)) {
            setTimeout(function() {
               $('#waifu-girl').css('z-index', ++env.maxIndex);
               $('#waifu-girl').show();
               blurAllWindows();
            }, 300);
         }
      }
   });

   jpTerminal.addCommand({
      name: 'keychecks',
      summary: 'display system level command history',
      manPage: 'SYNOPSIS\n' +
               '\tkeychecks\n\n' +
               'DESCRIPTION\n' +
               '\tA system level command log used for accountability purposes. keychecks must be\n\tactivated or deactivated via the main board.\n',
      command: function(env, inputLine) {
         var output = '13,42,121,32,88,77,19,13,44,52,77,90,13,99,13,100,13,109,55,103,144,13,99,87,60,13,44,12,09,13,43,63,13,46,57,89,103,122,13,44,52,88,931,13,21,13,57,98,100,102,103,13,112,13,146,13,13,13,77,67,88,23,13,13\n' +
            'system\n' +
            'nedry\n' +
            'go to command level\n' +
            'nedry\n' +
            '040/#xy/67&\n' +
            'mr goodbytes\n' +
            'security\n' +
            'keycheck off\n' +
            'safety off\n' +
            'sl off\n' +
            'security\n' +
            'whte_rbt.obj\n';

         $('#main-input').append(output);
      }
   });

   jpTerminal.addCommand({
      name: 'man',
      summary: 'display reference manual for a given command',
      manPage: 'SYNOPSIS\n' +
               '\tman title ...\n\n' +
               'DESCRIPTION\n' +
               '\tman locates and prints the titled entries from the on-line reference manuals.\n',
      command: function(env, inputLine) {
         var arg = inputLine.trim().split(/ +/)[1] || '';
         var output = 'What manual page do you want?';

         if (env.commands.hasOwnProperty(arg)) {
            output = env.commands[arg].manPage;
         } else if (arg) {
            output = 'No manual entry for ' + $('<div/>').text(arg).html();
         }

         $('#main-input').append(output);
      }
   });

   jpTerminal.addCommand({
      name: 'help', 
      summary: 'list available commands',
      manPage: 'SYNOPSIS\n' +
               '\thelp\n\n' +
               'DESCRIPTION\n' +
               '\tDisplay a command summary for Jurassic Systems.\n\n' +
               'AUTHOR\n' +
               '\tWritten by <a href="https://tully.io">Tully Robinson</a>.\n',
      command: function(env, inputLine) {
         for (var command in env.commands) {
            env.active.find('.command-history')
                      .append($('<div>').text(env.commands[command].name + ' - ' + env.commands[command].summary));
         }
      }
   });

   // helpers
   var flicker = function(altId, interval, duration) {
      var visible = true;
      var alt = $('#' + altId).show();
      var flickering = setInterval(function() {
             if (visible) {
                alt.css('opacity', '1');
             } else {
                alt.css('opacity', '0');
             }

             visible = !visible;
          }, interval);

      setTimeout(function() {
         clearInterval(flickering);
         alt.css('opacity', '0');
         alt.hide()
      }, duration);
   }

   var blurAllWindows = function() {
      $('.cursor', '.irix-window').removeClass('active-cursor');
      $('.buffer').blur();
   }

    // fix gif to load on every request.
    var hangGif = $('#hang-urself').attr('src');
    $('#hang-urself').attr('src', '');
    $('#hang-urself').attr('src', hangGif + "?"+new Date().getTime());

   $(document).ready(function() {
      // attempt to cache objects
      $(['waifuGirlWindow.jpg']).each(function() {
            new Image().src = '/img/' + this;
         });

      // remove boot screen
      setTimeout(function() {
         $('#irix-boot').remove();
         $('#main-buffer').focus();

         if (!location.pathname.match(/system/)) {
            $('#main-buffer').blur();
            $('#intro').show();
            $('#intro').click(function() {
               $(this).fadeOut(1000);
               $('#intro-scene').attr('src', '');
            });
         }
      }, 3400);

      $('body').click(blurAllWindows);

      (function() {
         var diffX = 0;
         var diffY = 0;

         $('.window-bar').mousedown(function(e) {
            var dragging = $(this).parent()
                                  .css('z-index', jpTerminal.nextIndex())
                                  .addClass('dragging');
            diffY = e.pageY - dragging.offset().top;
            diffX = e.pageX - dragging.offset().left;
         });

         $('body').mousemove(function(e) {
            $('.dragging').offset({
               top: e.pageY - diffY,
               left: e.pageX - diffX 
            });
         });
      }());

      $('body').mouseup(function(e) {
         $('.dragging').removeClass('dragging');
          if( whipEnabled ) {
              jpTerminal.whip();
          }
      });

      $('.irix-window').click(function(e) {
         e.stopPropagation();
         blurAllWindows();

         jpTerminal.setActive(this);

         $('.buffer', this).focus();
         $(this).css('z-index', jpTerminal.nextIndex());
         $(this).find('.cursor').addClass('active-cursor');
      });
      $('.irix-window').contextmenu(function(){
          return false;
      });
       $('body').contextmenu(function(){
           return false;
       });
      $(window).keydown(function(e) {
         if ([37, 38, 39, 40].indexOf(e.keyCode || e.which) > -1) {
            e.preventDefault();
         }
      });

      $('.irix-window').keydown(function(e) {
         var key = e.keyCode || e.which;
         var activeTerminal = jpTerminal.getActive();

         if (!activeTerminal) {
            return false;
         }

         // End Key to kill window
         if (key === 35) {
             $(this).hide();
         }
         // if up
         if (key === 38) {
             if (activeTerminal.attr('id') === 'main-terminal') {
                 if( !(typeof(jpTerminal.ComStackArr()[ jpTerminal.ComStackArr().length - (jpTerminal.ComStackNum() +1) ]) === 'undefined') ){
                     jpTerminal.ComStackInc();
                     $('#curr-main-input').text(jpTerminal.ComStackArr()[ jpTerminal.ComStackArr().length - jpTerminal.ComStackNum() ]);
                     activeTerminal.find('.buffer').val(jpTerminal.ComStackArr()[ jpTerminal.ComStackArr().length - jpTerminal.ComStackNum() ]);
                 }
             }
             return;
         }
         // if down
         if (key === 40){
             if (activeTerminal.attr('id') === 'main-terminal') {
                 if( !(typeof(jpTerminal.ComStackArr()[ jpTerminal.ComStackArr().length - (jpTerminal.ComStackNum() -1) ]) === 'undefined') ){
                     jpTerminal.ComStackDec();
                     $('#curr-main-input').text(jpTerminal.ComStackArr()[ jpTerminal.ComStackArr().length - jpTerminal.ComStackNum() ]);
                     activeTerminal.find('.buffer').val(jpTerminal.ComStackArr()[ jpTerminal.ComStackArr().length - jpTerminal.ComStackNum() ]);
                 }
             }
             return;
         }

         // if enter
         if (key === 13) {
            jpTerminal.ComStackReset();
            var line = $('#curr-main-input').text();
            activeTerminal.find('.buffer').val('');

            if (activeTerminal.attr('id') === 'chess-terminal') {
               $('#curr-chess-input').html('');
               activeTerminal.find('.command-history')
                             .append($('<div class="entered-command">')
                             .text(line || ' '));
            } else if (key == 14){ //alternative for enter

            } else {
               $('#curr-main-input').html('');
               jpTerminal.buildCommandLine(line);
            }
         }

         var wrap = activeTerminal.find('.inner-wrap');
         wrap.scrollTop(wrap[0].scrollHeight);
      });

      $('#main-terminal .buffer').bind('input propertychange', function() {
         var input = $(this).val();
         $('#curr-main-input').text(input);
      });

      $('#chess-terminal .buffer').bind('input propertychange', function() {
         var input = $(this).val();
         $('#curr-chess-input').text(input);
      });

      $('#apple-desktop').click(function(e){
         if ($(e.target).closest('.mac-window').attr('id') !== 'the-king-window') {
            flicker('the-king-blur', 50, 450);
         }
      });
   });
}(jQuery));
