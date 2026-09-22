This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
backend/
  .git/
    hooks/
      applypatch-msg.sample
      commit-msg.sample
      fsmonitor-watchman.sample
      post-update.sample
      pre-applypatch.sample
      pre-commit.sample
      pre-merge-commit.sample
      pre-push.sample
      pre-rebase.sample
      pre-receive.sample
      prepare-commit-msg.sample
      push-to-checkout.sample
      sendemail-validate.sample
      update.sample
    info/
      exclude
    logs/
      refs/
        heads/
          master
      HEAD
    objects/
      17/
        688fa571073e13a5235df3a4e7010917a6e422
      1c/
        a2350aee631eb81e7136693919064022d43687
      68/
        8c87e69a1cc97712b6a60cebe8cf5ac5f593d4
      87/
        e56100f87d5255452482b1b624a1777a3a1351
      96/
        98806dac96d03e8f0b5022bffca48e5d7ba7d3
      99/
        98021299229bbf1816b4ffd5ee987fc76f6d7a
      9c/
        1f7a1e6f3c8aa794f96991a785d5c98e64a08e
      c9/
        a287d60ad19afaf0ea25537ca0393df766e026
    refs/
      heads/
        master
    COMMIT_EDITMSG
    config
    description
    HEAD
    index
  src/
    server.ts
  .gitignore
  package.json
  README.md
  tsconfig.json
frontend/
  app/
    globals.css
    layout.tsx
    page.tsx
  public/
    assets/
      police/
        policelatest.fbx
      prisoner/
        Prisoner_02.fbx
        prisoner.glb
      bed.glb
      celldoor.glb
      cellwall.glb
      cellwallwithdoor.glb
      landframe.glb
      mainmap.glb
      map_-_prison_breakout_sniper_escape.glb
      maya2sketchfab.fbx
      old_key.glb
      old_key.png
      standarddoor.glb
      table.glb
  .gitignore
  AGENTS.md
  CLAUDE.md
  eslint.config.mjs
  next.config.ts
  package.json
  postcss.config.mjs
  README.md
  tsconfig.json
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="backend/.git/hooks/applypatch-msg.sample">
#!/bin/sh
#
# An example hook script to check the commit log message taken by
# applypatch from an e-mail message.
#
# The hook should exit with non-zero status after issuing an
# appropriate message if it wants to stop the commit.  The hook is
# allowed to edit the commit message file.
#
# To enable this hook, rename this file to "applypatch-msg".

. git-sh-setup
commitmsg="$(git rev-parse --git-path hooks/commit-msg)"
test -x "$commitmsg" && exec "$commitmsg" ${1+"$@"}
:
</file>

<file path="backend/.git/hooks/commit-msg.sample">
#!/bin/sh
#
# An example hook script to check the commit log message.
# Called by "git commit" with one argument, the name of the file
# that has the commit message.  The hook should exit with non-zero
# status after issuing an appropriate message if it wants to stop the
# commit.  The hook is allowed to edit the commit message file.
#
# To enable this hook, rename this file to "commit-msg".

# Uncomment the below to add a Signed-off-by line to the message.
# Doing this in a hook is a bad idea in general, but the prepare-commit-msg
# hook is more suited to it.
#
# SOB=$(git var GIT_AUTHOR_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# grep -qs "^$SOB" "$1" || echo "$SOB" >> "$1"

# This example catches duplicate Signed-off-by lines and messages that
# would confuse 'git am'.

ret=0

test "" = "$(grep '^Signed-off-by: ' "$1" |
	 sort | uniq -c | sed -e '/^[ 	]*1[ 	]/d')" || {
	echo >&2 Duplicate Signed-off-by lines.
	ret=1
}

comment_re="$(
	{
		git config --get-regexp "^core\.comment(char|string)\$" ||
			echo '#'
	} | sed -n -e '
		${
			s/^[^ ]* //
			s|[][*./\]|\\&|g
			s/^auto$/[#;@!$%^&|:]/
			p
		}'
)"
scissors_line="^${comment_re} -\{8,\} >8 -\{8,\}\$"
comment_line="^${comment_re}.*"
blank_line='^[ 	]*$'
# Disallow lines starting with "diff -" or "Index: " in the body of the
# message. Stop looking if we see a scissors line.
line="$(sed -n -e "
	# Skip comments and blank lines at the start of the file.
	/${scissors_line}/q
	/${comment_line}/d
	/${blank_line}/d
	# The first paragraph will become the subject header so
	# does not need to be checked.
	: subject
	n
	/${scissors_line}/q
	/${blank_line}/!b subject
	# Check the body of the message for problematic
	# prefixes.
	: body
	n
	/${scissors_line}/q
	/${comment_line}/b body
	/^diff -/{p;q;}
	/^Index: /{p;q;}
	b body
	" "$1")"
if test -n "$line"
then
	echo >&2 "Message contains a diff that will confuse 'git am'."
	echo >&2 "To fix this indent the diff."
	ret=1
fi

exit $ret
</file>

<file path="backend/.git/hooks/fsmonitor-watchman.sample">
#!/usr/bin/perl

use strict;
use warnings;
use IPC::Open2;

# An example hook script to integrate Watchman
# (https://facebook.github.io/watchman/) with git to speed up detecting
# new and modified files.
#
# The hook is passed a version (currently 2) and last update token
# formatted as a string and outputs to stdout a new update token and
# all files that have been modified since the update token. Paths must
# be relative to the root of the working tree and separated by a single NUL.
#
# To enable this hook, rename this file to "query-watchman" and set
# 'git config core.fsmonitor .git/hooks/query-watchman'
#
my ($version, $last_update_token) = @ARGV;

# Uncomment for debugging
# print STDERR "$0 $version $last_update_token\n";

# Check the hook interface version
if ($version ne 2) {
	die "Unsupported query-fsmonitor hook version '$version'.\n" .
	    "Falling back to scanning...\n";
}

my $git_work_tree = get_working_dir();

my $json_pkg;
eval {
	require JSON::XS;
	$json_pkg = "JSON::XS";
	1;
} or do {
	require JSON::PP;
	$json_pkg = "JSON::PP";
};

launch_watchman();

sub launch_watchman {
	my $o = watchman_query();
	if (is_work_tree_watched($o)) {
		output_result($o->{clock}, @{$o->{files}});
	}
}

sub output_result {
	my ($clockid, @files) = @_;

	# Uncomment for debugging watchman output
	# open (my $fh, ">", ".git/watchman-output.out");
	# binmode $fh, ":utf8";
	# print $fh "$clockid\n@files\n";
	# close $fh;

	binmode STDOUT, ":utf8";
	print $clockid;
	print "\0";
	local $, = "\0";
	print @files;
}

sub watchman_clock {
	my $response = qx/watchman clock "$git_work_tree"/;
	die "Failed to get clock id on '$git_work_tree'.\n" .
		"Falling back to scanning...\n" if $? != 0;

	return $json_pkg->new->utf8->decode($response);
}

sub watchman_query {
	my $pid = open2(\*CHLD_OUT, \*CHLD_IN, 'watchman -j --no-pretty')
	or die "open2() failed: $!\n" .
	"Falling back to scanning...\n";

	# In the query expression below we're asking for names of files that
	# changed since $last_update_token but not from the .git folder.
	#
	# To accomplish this, we're using the "since" generator to use the
	# recency index to select candidate nodes and "fields" to limit the
	# output to file names only. Then we're using the "expression" term to
	# further constrain the results.
	my $last_update_line = "";
	if (substr($last_update_token, 0, 1) eq "c") {
		$last_update_token = "\"$last_update_token\"";
		$last_update_line = qq[\n"since": $last_update_token,];
	}
	my $query = <<"	END";
		["query", "$git_work_tree", {$last_update_line
			"fields": ["name"],
			"expression": ["not", ["dirname", ".git"]]
		}]
	END

	# Uncomment for debugging the watchman query
	# open (my $fh, ">", ".git/watchman-query.json");
	# print $fh $query;
	# close $fh;

	print CHLD_IN $query;
	close CHLD_IN;
	my $response = do {local $/; <CHLD_OUT>};

	# Uncomment for debugging the watch response
	# open ($fh, ">", ".git/watchman-response.json");
	# print $fh $response;
	# close $fh;

	die "Watchman: command returned no output.\n" .
	"Falling back to scanning...\n" if $response eq "";
	die "Watchman: command returned invalid output: $response\n" .
	"Falling back to scanning...\n" unless $response =~ /^\{/;

	return $json_pkg->new->utf8->decode($response);
}

sub is_work_tree_watched {
	my ($output) = @_;
	my $error = $output->{error};
	if ($error and $error =~ m/unable to resolve root .* directory (.*) is not watched/) {
		my $response = qx/watchman watch "$git_work_tree"/;
		die "Failed to make watchman watch '$git_work_tree'.\n" .
		    "Falling back to scanning...\n" if $? != 0;
		$output = $json_pkg->new->utf8->decode($response);
		$error = $output->{error};
		die "Watchman: $error.\n" .
		"Falling back to scanning...\n" if $error;

		# Uncomment for debugging watchman output
		# open (my $fh, ">", ".git/watchman-output.out");
		# close $fh;

		# Watchman will always return all files on the first query so
		# return the fast "everything is dirty" flag to git and do the
		# Watchman query just to get it over with now so we won't pay
		# the cost in git to look up each individual file.
		my $o = watchman_clock();
		$error = $o->{error};

		die "Watchman: $error.\n" .
		"Falling back to scanning...\n" if $error;

		output_result($o->{clock}, ("/"));
		return 0;
	}

	die "Watchman: $error.\n" .
	"Falling back to scanning...\n" if $error;

	return 1;
}

sub get_working_dir {
	my $working_dir;
	if ($^O =~ 'msys' || $^O =~ 'cygwin') {
		$working_dir = Win32::GetCwd();
		$working_dir =~ tr/\\/\//;
	} else {
		require Cwd;
		$working_dir = Cwd::cwd();
	}

	return $working_dir;
}
</file>

<file path="backend/.git/hooks/post-update.sample">
#!/bin/sh
#
# An example hook script to prepare a packed repository for use over
# dumb transports.
#
# To enable this hook, rename this file to "post-update".

exec git update-server-info
</file>

<file path="backend/.git/hooks/pre-applypatch.sample">
#!/bin/sh
#
# An example hook script to verify what is about to be committed
# by applypatch from an e-mail message.
#
# The hook should exit with non-zero status after issuing an
# appropriate message if it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-applypatch".

. git-sh-setup
precommit="$(git rev-parse --git-path hooks/pre-commit)"
test -x "$precommit" && exec "$precommit" ${1+"$@"}
:
</file>

<file path="backend/.git/hooks/pre-commit.sample">
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

if git rev-parse --verify HEAD >/dev/null 2>&1
then
	against=HEAD
else
	# Initial commit: diff against an empty tree object
	against=$(git hash-object -t tree /dev/null)
fi

# If you want to allow non-ASCII filenames set this variable to true.
allownonascii=$(git config --type=bool hooks.allownonascii)

# Redirect output to stderr.
exec 1>&2

# Cross platform projects tend to avoid non-ASCII filenames; prevent
# them from being added to the repository. We exploit the fact that the
# printable range starts at the space character and ends with tilde.
if [ "$allownonascii" != "true" ] &&
	# Note that the use of brackets around a tr range is ok here, (it's
	# even required, for portability to Solaris 10's /usr/bin/tr), since
	# the square bracket bytes happen to fall in the designated range.
	test $(git diff-index --cached --name-only --diff-filter=A -z $against |
	  LC_ALL=C tr -d '[ -~]\0' | wc -c) != 0
then
	cat <<\EOF
Error: Attempt to add a non-ASCII file name.

This can cause problems if you want to work with people on other platforms.

To be portable it is advisable to rename the file.

If you know what you are doing you can disable this check using:

  git config hooks.allownonascii true
EOF
	exit 1
fi

# If there are whitespace errors, print the offending file names and fail.
exec git diff-index --check --cached $against --
</file>

<file path="backend/.git/hooks/pre-merge-commit.sample">
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git merge" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message to
# stderr if it wants to stop the merge commit.
#
# To enable this hook, rename this file to "pre-merge-commit".

. git-sh-setup
test -x "$GIT_DIR/hooks/pre-commit" &&
        exec "$GIT_DIR/hooks/pre-commit"
:
</file>

<file path="backend/.git/hooks/pre-push.sample">
#!/bin/sh

# An example hook script to verify what is about to be pushed.  Called by "git
# push" after it has checked the remote status, but before anything has been
# pushed.  If this script exits with a non-zero status nothing will be pushed.
#
# This hook is called with the following parameters:
#
# $1 -- Name of the remote to which the push is being done
# $2 -- URL to which the push is being done
#
# If pushing without using a named remote those arguments will be equal.
#
# Information about the commits which are being pushed is supplied as lines to
# the standard input in the form:
#
#   <local ref> <local oid> <remote ref> <remote oid>
#
# This sample shows how to prevent push of commits where the log message starts
# with "WIP" (work in progress).

remote="$1"
url="$2"

zero=$(git hash-object --stdin </dev/null | tr '[0-9a-f]' '0')

while read local_ref local_oid remote_ref remote_oid
do
	if test "$local_oid" = "$zero"
	then
		# Handle delete
		:
	else
		if test "$remote_oid" = "$zero"
		then
			# New branch, examine all commits
			range="$local_oid"
		else
			# Update to existing branch, examine new commits
			range="$remote_oid..$local_oid"
		fi

		# Check for WIP commit
		commit=$(git rev-list -n 1 --grep '^WIP' "$range")
		if test -n "$commit"
		then
			echo >&2 "Found WIP commit in $local_ref, not pushing"
			exit 1
		fi
	fi
done

exit 0
</file>

<file path="backend/.git/hooks/pre-rebase.sample">
#!/bin/sh
#
# Copyright (c) 2006, 2008 Junio C Hamano
#
# The "pre-rebase" hook is run just before "git rebase" starts doing
# its job, and can prevent the command from running by exiting with
# non-zero status.
#
# The hook is called with the following parameters:
#
# $1 -- the upstream the series was forked from.
# $2 -- the branch being rebased (or empty when rebasing the current branch).
#
# This sample shows how to prevent topic branches that are already
# merged to 'next' branch from getting rebased, because allowing it
# would result in rebasing already published history.

publish=next
basebranch="$1"
if test "$#" = 2
then
	topic="refs/heads/$2"
else
	topic=`git symbolic-ref HEAD` ||
	exit 0 ;# we do not interrupt rebasing detached HEAD
fi

case "$topic" in
refs/heads/??/*)
	;;
*)
	exit 0 ;# we do not interrupt others.
	;;
esac

# Now we are dealing with a topic branch being rebased
# on top of master.  Is it OK to rebase it?

# Does the topic really exist?
git show-ref -q "$topic" || {
	echo >&2 "No such branch $topic"
	exit 1
}

# Is topic fully merged to master?
not_in_master=`git rev-list --pretty=oneline ^master "$topic"`
if test -z "$not_in_master"
then
	echo >&2 "$topic is fully merged to master; better remove it."
	exit 1 ;# we could allow it, but there is no point.
fi

# Is topic ever merged to next?  If so you should not be rebasing it.
only_next_1=`git rev-list ^master "^$topic" ${publish} | sort`
only_next_2=`git rev-list ^master           ${publish} | sort`
if test "$only_next_1" = "$only_next_2"
then
	not_in_topic=`git rev-list "^$topic" master`
	if test -z "$not_in_topic"
	then
		echo >&2 "$topic is already up to date with master"
		exit 1 ;# we could allow it, but there is no point.
	else
		exit 0
	fi
else
	not_in_next=`git rev-list --pretty=oneline ^${publish} "$topic"`
	/usr/bin/perl -e '
		my $topic = $ARGV[0];
		my $msg = "* $topic has commits already merged to public branch:\n";
		my (%not_in_next) = map {
			/^([0-9a-f]+) /;
			($1 => 1);
		} split(/\n/, $ARGV[1]);
		for my $elem (map {
				/^([0-9a-f]+) (.*)$/;
				[$1 => $2];
			} split(/\n/, $ARGV[2])) {
			if (!exists $not_in_next{$elem->[0]}) {
				if ($msg) {
					print STDERR $msg;
					undef $msg;
				}
				print STDERR " $elem->[1]\n";
			}
		}
	' "$topic" "$not_in_next" "$not_in_master"
	exit 1
fi

<<\DOC_END

This sample hook safeguards topic branches that have been
published from being rewound.

The workflow assumed here is:

 * Once a topic branch forks from "master", "master" is never
   merged into it again (either directly or indirectly).

 * Once a topic branch is fully cooked and merged into "master",
   it is deleted.  If you need to build on top of it to correct
   earlier mistakes, a new topic branch is created by forking at
   the tip of the "master".  This is not strictly necessary, but
   it makes it easier to keep your history simple.

 * Whenever you need to test or publish your changes to topic
   branches, merge them into "next" branch.

The script, being an example, hardcodes the publish branch name
to be "next", but it is trivial to make it configurable via
$GIT_DIR/config mechanism.

With this workflow, you would want to know:

(1) ... if a topic branch has ever been merged to "next".  Young
    topic branches can have stupid mistakes you would rather
    clean up before publishing, and things that have not been
    merged into other branches can be easily rebased without
    affecting other people.  But once it is published, you would
    not want to rewind it.

(2) ... if a topic branch has been fully merged to "master".
    Then you can delete it.  More importantly, you should not
    build on top of it -- other people may already want to
    change things related to the topic as patches against your
    "master", so if you need further changes, it is better to
    fork the topic (perhaps with the same name) afresh from the
    tip of "master".

Let's look at this example:

		   o---o---o---o---o---o---o---o---o---o "next"
		  /       /           /           /
		 /   a---a---b A     /           /
		/   /               /           /
	       /   /   c---c---c---c B         /
	      /   /   /             \         /
	     /   /   /   b---b C     \       /
	    /   /   /   /             \     /
    ---o---o---o---o---o---o---o---o---o---o---o "master"


A, B and C are topic branches.

 * A has one fix since it was merged up to "next".

 * B has finished.  It has been fully merged up to "master" and "next",
   and is ready to be deleted.

 * C has not merged to "next" at all.

We would want to allow C to be rebased, refuse A, and encourage
B to be deleted.

To compute (1):

	git rev-list ^master ^topic next
	git rev-list ^master        next

	if these match, topic has not merged in next at all.

To compute (2):

	git rev-list master..topic

	if this is empty, it is fully merged to "master".

DOC_END
</file>

<file path="backend/.git/hooks/pre-receive.sample">
#!/bin/sh
#
# An example hook script to make use of push options.
# The example simply echoes all push options that start with 'echoback='
# and rejects all pushes when the "reject" push option is used.
#
# To enable this hook, rename this file to "pre-receive".

if test -n "$GIT_PUSH_OPTION_COUNT"
then
	i=0
	while test "$i" -lt "$GIT_PUSH_OPTION_COUNT"
	do
		eval "value=\$GIT_PUSH_OPTION_$i"
		case "$value" in
		echoback=*)
			echo "echo from the pre-receive-hook: ${value#*=}" >&2
			;;
		reject)
			exit 1
		esac
		i=$((i + 1))
	done
fi
</file>

<file path="backend/.git/hooks/prepare-commit-msg.sample">
#!/bin/sh
#
# An example hook script to prepare the commit log message.
# Called by "git commit" with the name of the file that has the
# commit message, followed by the description of the commit
# message's source.  The hook's purpose is to edit the commit
# message file.  If the hook fails with a non-zero status,
# the commit is aborted.
#
# To enable this hook, rename this file to "prepare-commit-msg".

# This hook includes three examples. The first one removes the
# "# Please enter the commit message..." help message.
#
# The second includes the output of "git diff --name-status -r"
# into the message, just before the "git status" output.  It is
# commented because it doesn't cope with --amend or with squashed
# commits.
#
# The third example adds a Signed-off-by line to the message, that can
# still be edited.  This is rarely a good idea.

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

/usr/bin/perl -i.bak -ne 'print unless(m/^. Please enter the commit message/..m/^#$/)' "$COMMIT_MSG_FILE"

# case "$COMMIT_SOURCE,$SHA1" in
#  ,|template,)
#    /usr/bin/perl -i.bak -pe '
#       print "\n" . `git diff --cached --name-status -r`
# 	 if /^#/ && $first++ == 0' "$COMMIT_MSG_FILE" ;;
#  *) ;;
# esac

# SOB=$(git var GIT_COMMITTER_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# git interpret-trailers --in-place --trailer "$SOB" "$COMMIT_MSG_FILE"
# if test -z "$COMMIT_SOURCE"
# then
#   /usr/bin/perl -i.bak -pe 'print "\n" if !$first_line++' "$COMMIT_MSG_FILE"
# fi
</file>

<file path="backend/.git/hooks/push-to-checkout.sample">
#!/bin/sh

# An example hook script to update a checked-out tree on a git push.
#
# This hook is invoked by git-receive-pack(1) when it reacts to git
# push and updates reference(s) in its repository, and when the push
# tries to update the branch that is currently checked out and the
# receive.denyCurrentBranch configuration variable is set to
# updateInstead.
#
# By default, such a push is refused if the working tree and the index
# of the remote repository has any difference from the currently
# checked out commit; when both the working tree and the index match
# the current commit, they are updated to match the newly pushed tip
# of the branch. This hook is to be used to override the default
# behaviour; however the code below reimplements the default behaviour
# as a starting point for convenient modification.
#
# The hook receives the commit with which the tip of the current
# branch is going to be updated:
commit=$1

# It can exit with a non-zero status to refuse the push (when it does
# so, it must not modify the index or the working tree).
die () {
	echo >&2 "$*"
	exit 1
}

# Or it can make any necessary changes to the working tree and to the
# index to bring them to the desired state when the tip of the current
# branch is updated to the new commit, and exit with a zero status.
#
# For example, the hook can simply run git read-tree -u -m HEAD "$1"
# in order to emulate git fetch that is run in the reverse direction
# with git push, as the two-tree form of git read-tree -u -m is
# essentially the same as git switch or git checkout that switches
# branches while keeping the local changes in the working tree that do
# not interfere with the difference between the branches.

# The below is a more-or-less exact translation to shell of the C code
# for the default behaviour for git's push-to-checkout hook defined in
# the push_to_deploy() function in builtin/receive-pack.c.
#
# Note that the hook will be executed from the repository directory,
# not from the working tree, so if you want to perform operations on
# the working tree, you will have to adapt your code accordingly, e.g.
# by adding "cd .." or using relative paths.

if ! git update-index -q --ignore-submodules --refresh
then
	die "Up-to-date check failed"
fi

if ! git diff-files --quiet --ignore-submodules --
then
	die "Working directory has unstaged changes"
fi

# This is a rough translation of:
#
#   head_has_history() ? "HEAD" : EMPTY_TREE_SHA1_HEX
if git cat-file -e HEAD 2>/dev/null
then
	head=HEAD
else
	head=$(git hash-object -t tree --stdin </dev/null)
fi

if ! git diff-index --quiet --cached --ignore-submodules $head --
then
	die "Working directory has staged changes"
fi

if ! git read-tree -u -m "$commit"
then
	die "Could not update working tree to new HEAD"
fi
</file>

<file path="backend/.git/hooks/sendemail-validate.sample">
#!/bin/sh

# An example hook script to validate a patch (and/or patch series) before
# sending it via email.
#
# The hook should exit with non-zero status after issuing an appropriate
# message if it wants to prevent the email(s) from being sent.
#
# To enable this hook, rename this file to "sendemail-validate".
#
# By default, it will only check that the patch(es) can be applied on top of
# the default upstream branch without conflicts in a secondary worktree. After
# validation (successful or not) of the last patch of a series, the worktree
# will be deleted.
#
# The following config variables can be set to change the default remote and
# remote ref that are used to apply the patches against:
#
#   sendemail.validateRemote (default: origin)
#   sendemail.validateRemoteRef (default: HEAD)
#
# Replace the TODO placeholders with appropriate checks according to your
# needs.

validate_cover_letter () {
	file="$1"
	# TODO: Replace with appropriate checks (e.g. spell checking).
	true
}

validate_patch () {
	file="$1"
	# Ensure that the patch applies without conflicts.
	git am -3 "$file" || return
	# TODO: Replace with appropriate checks for this patch
	# (e.g. checkpatch.pl).
	true
}

validate_series () {
	# TODO: Replace with appropriate checks for the whole series
	# (e.g. quick build, coding style checks, etc.).
	true
}

# main -------------------------------------------------------------------------

if test "$GIT_SENDEMAIL_FILE_COUNTER" = 1
then
	remote=$(git config --default origin --get sendemail.validateRemote) &&
	ref=$(git config --default HEAD --get sendemail.validateRemoteRef) &&
	worktree=$(mktemp --tmpdir -d sendemail-validate.XXXXXXX) &&
	git worktree add -fd --checkout "$worktree" "refs/remotes/$remote/$ref" &&
	git config --replace-all sendemail.validateWorktree "$worktree"
else
	worktree=$(git config --get sendemail.validateWorktree)
fi || {
	echo "sendemail-validate: error: failed to prepare worktree" >&2
	exit 1
}

unset GIT_DIR GIT_WORK_TREE
cd "$worktree" &&

if grep -q "^diff --git " "$1"
then
	validate_patch "$1"
else
	validate_cover_letter "$1"
fi &&

if test "$GIT_SENDEMAIL_FILE_COUNTER" = "$GIT_SENDEMAIL_FILE_TOTAL"
then
	git config --unset-all sendemail.validateWorktree &&
	trap 'git worktree remove -ff "$worktree"' EXIT &&
	validate_series
fi
</file>

<file path="backend/.git/hooks/update.sample">
#!/bin/sh
#
# An example hook script to block unannotated tags from entering.
# Called by "git receive-pack" with arguments: refname sha1-old sha1-new
#
# To enable this hook, rename this file to "update".
#
# Config
# ------
# hooks.allowunannotated
#   This boolean sets whether unannotated tags will be allowed into the
#   repository.  By default they won't be.
# hooks.allowdeletetag
#   This boolean sets whether deleting tags will be allowed in the
#   repository.  By default they won't be.
# hooks.allowmodifytag
#   This boolean sets whether a tag may be modified after creation. By default
#   it won't be.
# hooks.allowdeletebranch
#   This boolean sets whether deleting branches will be allowed in the
#   repository.  By default they won't be.
# hooks.denycreatebranch
#   This boolean sets whether remotely creating branches will be denied
#   in the repository.  By default this is allowed.
#

# --- Command line
refname="$1"
oldrev="$2"
newrev="$3"

# --- Safety check
if [ -z "$GIT_DIR" ]; then
	echo "Don't run this script from the command line." >&2
	echo " (if you want, you could supply GIT_DIR then run" >&2
	echo "  $0 <ref> <oldrev> <newrev>)" >&2
	exit 1
fi

if [ -z "$refname" -o -z "$oldrev" -o -z "$newrev" ]; then
	echo "usage: $0 <ref> <oldrev> <newrev>" >&2
	exit 1
fi

# --- Config
allowunannotated=$(git config --type=bool hooks.allowunannotated)
allowdeletebranch=$(git config --type=bool hooks.allowdeletebranch)
denycreatebranch=$(git config --type=bool hooks.denycreatebranch)
allowdeletetag=$(git config --type=bool hooks.allowdeletetag)
allowmodifytag=$(git config --type=bool hooks.allowmodifytag)

# check for no description
projectdesc=$(sed -e '1q' "$GIT_DIR/description")
case "$projectdesc" in
"Unnamed repository"* | "")
	echo "*** Project description file hasn't been set" >&2
	exit 1
	;;
esac

# --- Check types
# if $newrev is 0000...0000, it's a commit to delete a ref.
zero=$(git hash-object --stdin </dev/null | tr '[0-9a-f]' '0')
if [ "$newrev" = "$zero" ]; then
	newrev_type=delete
else
	newrev_type=$(git cat-file -t $newrev)
fi

case "$refname","$newrev_type" in
	refs/tags/*,commit)
		# un-annotated tag
		short_refname=${refname##refs/tags/}
		if [ "$allowunannotated" != "true" ]; then
			echo "*** The un-annotated tag, $short_refname, is not allowed in this repository" >&2
			echo "*** Use 'git tag [ -a | -s ]' for tags you want to propagate." >&2
			exit 1
		fi
		;;
	refs/tags/*,delete)
		# delete tag
		if [ "$allowdeletetag" != "true" ]; then
			echo "*** Deleting a tag is not allowed in this repository" >&2
			exit 1
		fi
		;;
	refs/tags/*,tag)
		# annotated tag
		if [ "$allowmodifytag" != "true" ] && git rev-parse $refname > /dev/null 2>&1
		then
			echo "*** Tag '$refname' already exists." >&2
			echo "*** Modifying a tag is not allowed in this repository." >&2
			exit 1
		fi
		;;
	refs/heads/*,commit)
		# branch
		if [ "$oldrev" = "$zero" -a "$denycreatebranch" = "true" ]; then
			echo "*** Creating a branch is not allowed in this repository" >&2
			exit 1
		fi
		;;
	refs/heads/*,delete)
		# delete branch
		if [ "$allowdeletebranch" != "true" ]; then
			echo "*** Deleting a branch is not allowed in this repository" >&2
			exit 1
		fi
		;;
	refs/remotes/*,commit)
		# tracking branch
		;;
	refs/remotes/*,delete)
		# delete tracking branch
		if [ "$allowdeletebranch" != "true" ]; then
			echo "*** Deleting a tracking branch is not allowed in this repository" >&2
			exit 1
		fi
		;;
	*)
		# Anything else (is there anything else?)
		echo "*** Update hook: unknown type of update to ref $refname of type $newrev_type" >&2
		exit 1
		;;
esac

# --- Finished
exit 0
</file>

<file path="backend/.git/info/exclude">
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~
</file>

<file path="backend/.git/logs/refs/heads/master">
0000000000000000000000000000000000000000 17688fa571073e13a5235df3a4e7010917a6e422 haniejeilat <146081052+haniejeilat@users.noreply.github.com> 1789580695 +0300	commit (initial): Initial commit (via bun create)
</file>

<file path="backend/.git/logs/HEAD">
0000000000000000000000000000000000000000 17688fa571073e13a5235df3a4e7010917a6e422 haniejeilat <146081052+haniejeilat@users.noreply.github.com> 1789580695 +0300	commit (initial): Initial commit (via bun create)
</file>

<file path="backend/.git/refs/heads/master">
17688fa571073e13a5235df3a4e7010917a6e422
</file>

<file path="backend/.git/COMMIT_EDITMSG">
Initial commit (via bun create)
</file>

<file path="backend/.git/config">
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
</file>

<file path="backend/.git/description">
Unnamed repository; edit this file 'description' to name the repository.
</file>

<file path="backend/.git/HEAD">
ref: refs/heads/master
</file>

<file path="backend/src/server.ts">
import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
</file>

<file path="backend/.gitignore">
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

**/*.trace
**/*.zip
**/*.tar.gz
**/*.tgz
**/*.log
package-lock.json
**/*.bun
</file>

<file path="backend/package.json">
{
  "name": "backend",
  "version": "1.0.50",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "bun run --watch src/server.ts"
    },
  "dependencies": {
    "elysia": "latest"
  },
  "devDependencies": {
    "bun-types": "latest"
  },
  "module": "src/index.js"
}
</file>

<file path="backend/README.md">
# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.
</file>

<file path="backend/tsconfig.json">
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ESNext",
    "lib": ["ESNext"],
    "moduleDetection": "force",

    /* Modules */
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["bun-types"],
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    /* Interop Constraints */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    /* Type Checking */
    "strict": true,
    "skipLibCheck": true
  }
}
</file>

<file path="frontend/app/layout.tsx">
'use client'
import "@/app/globals.css";

export default function Rootlayout({children} : {children  :React.ReactNode}) {
  return <html lang="ar">
      <body>{children}</body>
    </html>;
    
}
</file>

<file path="frontend/.gitignore">
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
</file>

<file path="frontend/AGENTS.md">
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
</file>

<file path="frontend/CLAUDE.md">
@AGENTS.md
</file>

<file path="frontend/eslint.config.mjs">
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
</file>

<file path="frontend/next.config.ts">
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
</file>

<file path="frontend/package.json">
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@belivvr/aframe-react": "^0.4.2",
    "aframe": "^1.8.0",
    "aframe-extras": "^7.7.0",
    "next": "16.3.5",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/aframe": "^1.2.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  },
  "packageManager": "bun@1.3.14",
  "ignoreScripts": [
    "sharp",
    "unrs-resolver"
  ],
  "trustedDependencies": [
    "sharp",
    "unrs-resolver"
  ]
}
</file>

<file path="frontend/postcss.config.mjs">
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
</file>

<file path="frontend/README.md">
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
#frontend 
npm run dev
# or
bun run dev


# or

#backend
bun run dev
# or
npm run dev

url for run on web will be shared later or never be share based on offline game standards

```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
</file>

<file path="frontend/tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
</file>

<file path="frontend/app/globals.css">
#inventory-container{
 display: none;
grid-template-columns: repeat(4, minmax(0, 1fr));
 grid-template-rows: repeat(4, minmax(0, 1fr));
 margin: 0;
 padding: 0;
 position:absolute;
 top : 50%;
 left: 50%;
transform: translate(-50%, -50%);
width : 70%;
height : 70%;
z-index: 11;
background: rgb(0, 0 ,0 , 0.2);
border-radius : 8px;
}

[id^='box-']{
width: 100%;
height: 100%;
}
</file>

<file path="frontend/app/page.tsx">
//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";

export default function VRScence() {
  const walkref = useRef(null)
  , camref = useRef(null)
  ,inventoryref = useRef(null)
  ,keyref = useRef(null)
  ,Doorref = useRef(null)
  ,landref = useRef(null)
  ,wallref = useRef(null)
  ,wallref1 = useRef(null)
  ,wallref2 = useRef(null)
  ,wallwithdoor = useRef(null)
  ,npcpolice = useRef(null);

  const [items, setItems] = useState<string[]>([]);
  const itemsref = useRef([]);
  itemsref.current = items;

  useEffect(() => {
    require('aframe');
    require('aframe-extras');
    const THREE = window.AFRAME.THREE;
    const raycaster = new THREE.Raycaster();

    const SPEED = 20;
    const NPCSPEED = 7;
    const SENS = 0.0022;
    const keys = {};
    let yaw = 0;
    let pitch = 0;
    let doorOpen = false;

    const GRAVITY = 30;
    const STEP = 1;
    const DOWN = new THREE.Vector3(0, -1, 0);
    const groundRay = new THREE.Raycaster();
    const doorRay = new THREE.Raycaster();
    const wallBox1 = new THREE.Box3();
    const wallBox2 = new THREE.Box3();
    const wallBox3 = new THREE.Box3();
    const wallwithdoorBox = new THREE.Box3();
    const doorHoleBox = new THREE.Box3();
    let doorHoleCaptured = false;
    let vy = 0;
    let npcvy = 0;
    const JUMP = 12;
    let onGround = false;

    const moveRay = new THREE.Raycaster(); 
    const FRONT = new THREE.Vector3(0 , 0 , 1);
    const ENDNPC = -20;
    const STARTNPC = 20;
   let firstdone = false;
   
    const down = (e) => {
      keys[e.code] = true;
      if (e.code === 'KeyG' && inventoryref.current) inventoryref.current.style.display = 'grid';
      if (e.code === 'KeyE' && itemsref.current.includes('old_key') && !doorOpen) {
        doorOpen = true;
        Doorref.current?.setAttribute('gltf-model', '#celldoorModel');
        Doorref.current?.setAttribute('animation-mixer', 'loop: once; clampWhenFinished: true');
        Doorref.current?.setAttribute('position', '14.97 0 26.2');
      }
      if (e.code === 'Space' && onGround) {
        vy = JUMP;
      }
    };

    const up = (e) => {
      keys[e.code] = false;
      if (e.code === 'KeyG' && inventoryref.current) inventoryref.current.style.display = 'none';
    };

    const onMouseMove = (e) => {
      if (!document.pointerLockElement) return;
      yaw -= e.movementX * SENS;
      pitch -= e.movementY * SENS;
      pitch = Math.max(-1.55, Math.min(1.55, pitch));
      if (walkref.current?.object3D) walkref.current.object3D.rotation.y = yaw;
      if (camref.current?.object3D) camref.current.object3D.rotation.x = pitch;
    };

    const onClick = () => {
      const canvas = document.querySelector('a-scene canvas');
      if (canvas && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
        return;
      }

      const cam = document.querySelector('a-scene')?.camera;
      const key = keyref.current;
      if (!cam || !key?.object3D) return;
      raycaster.setFromCamera({ x: 0, y: 0 }, cam);
      if (raycaster.intersectObject(key.object3D, true).length) {
        setItems((prev) => (prev.includes('old_key') ? prev : [...prev, 'old_key']));
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    let raf;
    let last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
       
      let dt;
      if (last !== 0) {
        dt = Math.min((now - last) / 1000, 0.1);
      } else {
        dt = 0;
      }
      last = now;

      const el = walkref.current;
      const doorel = Doorref.current;
      const Wallrel = wallref.current;
      const Wallrel1 = wallref1.current;
      const Wallrel2 = wallref2.current;
      const Wallrelwithdoor = wallwithdoor.current;
      const npcrel = npcpolice.current;
      if (!el?.object3D) return;

      const pos = el.object3D.position;
      const land = landref.current?.getObject3D('mesh');
      const NPCpos = npcrel.object3D.position;
      if (land) {
        groundRay.set(new THREE.Vector3(pos.x, pos.y + STEP, pos.z), DOWN);
        const hit = groundRay.intersectObject(land, true)[0];
        if (hit && vy <= 0 && pos.y <= hit.point.y + 0.05) {
          pos.y = hit.point.y;
          vy = 0;
          onGround = true;
        } else {
          vy -= GRAVITY * dt;
          pos.y += vy * dt;
          onGround = false;
        }
      
       moveRay.set(new THREE.Vector3(NPCpos.x , NPCpos.y + STEP, NPCpos.z ), DOWN);
      const connect = moveRay.intersectObject(land,true)[0];
      if(connect && npcvy <= 0 && NPCpos.y <= connect.point.y + 0.05){
       NPCpos.y = connect.point.y;
       npcvy = 0;
      }
      else {
        npcvy -= GRAVITY * dt;
        NPCpos.y += npcvy * dt;
      }
      if(!firstdone){
        if(NPCpos.z <= ENDNPC){
        NPCpos.z = ENDNPC;
        npcrel.object3D.rotation.y = 0;
        firstdone = true;
      }
     else {
        NPCpos.z -= NPCSPEED * dt;
        }
      }
    
      else{
        if(NPCpos.z >= STARTNPC){
          NPCpos.z = STARTNPC;
          npcrel.object3D.rotation.y = Math.PI;
          firstdone = false;
          }
        else {
          NPCpos.z += NPCSPEED * dt;
        }  
      }
}

      
      
     

      const x = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const z = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);
      if (!x && !z) return;

      const len = Math.sqrt(x ** 2 + z ** 2);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      const dx = (x * cos + z * sin) / len;
      const dz = (-x * sin + z * cos) / len;
      const nx = pos.x + dx * SPEED * dt;
      const nz = pos.z + dz * SPEED * dt;

      let blockedwall1 = false;
      let blockedwall2 = false;
      let blockedwall3 = false;
      let blockedwallwithdoor = false;

      if (
        Wallrel?.object3D &&
        Wallrel1?.object3D &&
        Wallrel2?.object3D &&
        Wallrelwithdoor?.object3D
      ) {
        wallBox1.setFromObject(Wallrel.object3D).expandByScalar(0.5);
        wallBox2.setFromObject(Wallrel1.object3D).expandByScalar(0.5);
        wallBox3.setFromObject(Wallrel2.object3D).expandByScalar(0.5);
        wallwithdoorBox.setFromObject(Wallrelwithdoor.object3D);

        
        if (!doorHoleCaptured && doorel?.object3D) {
          doorHoleBox.setFromObject(doorel.object3D);
          doorHoleCaptured = true;
        }

        blockedwall1 =
          pos.y < wallBox1.max.y &&
          nx > wallBox1.min.x && nx < wallBox1.max.x &&
          nz > wallBox1.min.z && nz < wallBox1.max.z;

        blockedwall2 =
          pos.y < wallBox2.max.y &&
          nx > wallBox2.min.x && nx < wallBox2.max.x &&
          nz > wallBox2.min.z && nz < wallBox2.max.z;

        blockedwall3 =
          pos.y < wallBox3.max.y &&
          nx > wallBox3.min.x && nx < wallBox3.max.x &&
          nz > wallBox3.min.z && nz < wallBox3.max.z;

        const inholedoor =
          doorHoleCaptured &&
          nx > doorHoleBox.min.x && nx < doorHoleBox.max.x &&
          nz > doorHoleBox.min.z && nz < doorHoleBox.max.z;

        blockedwallwithdoor =
          pos.y < wallwithdoorBox.max.y &&
          nx > wallwithdoorBox.min.x && nx < wallwithdoorBox.max.x &&
          nz > wallwithdoorBox.min.z && nz < wallwithdoorBox.max.z &&
          !(doorOpen && inholedoor);
      }

      if (!blockedwall1 && !blockedwall2 && !blockedwall3 && !blockedwallwithdoor) {
        pos.x = nx;
        pos.z = nz;
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  const GridShortCut = (url_newimg: string, order: number) => {
    return <img key={order} id={`box-${order}`} src={url_newimg} alt="" />;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <a-scene embedded renderer="colorManagement: true">
        <a-assets>
          <a-asset-item id="landModel" src="/assets/landframe.glb"></a-asset-item>
          <a-asset-item id="prisonerModel" src="/assets/prisoner/prisoner.glb"></a-asset-item>
          <a-asset-item id="keyModel" src="/assets/old_key.glb"></a-asset-item>
          <a-asset-item id="standarddoorModel" src="/assets/standarddoor.glb"></a-asset-item>
          <a-asset-item id="celldoorModel" src="/assets/celldoor.glb"></a-asset-item>
          <a-asset-item id="cellwallModel" src="/assets/cellwall.glb"></a-asset-item>
          <a-asset-item id="cellwallwithdoorModel" src="/assets/cellwallwithdoor.glb"></a-asset-item>
          <a-asset-item id = "policeModel" src = "/assets/prisoner/prisoner.glb"></a-asset-item>
        </a-assets>

        <a-sky color="#87CEED"></a-sky>

        <a-entity position="-19 0 6" ref={walkref}>
          <a-entity camera="" ref={camref} position="0 3.54 -0.5"></a-entity>
          <a-entity
            scale="0.016 0.016 0.016"
            gltf-model="#prisonerModel"
            position="0.23 1 0"
            rotation="0 180 0"
            animation-mixer
          ></a-entity>
        </a-entity>

        <a-entity
          ref={landref}
          gltf-model="#landModel"
          position="0 0 0"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

        {!items.includes('old_key') && (
          <a-entity
            ref={keyref}
            gltf-model="#keyModel"
            position="0 2 30"
            scale="1 1 1"
            matrixAutoUpdate="false"
          ></a-entity>
        )}

        <a-entity
          ref={wallref}
          position="20 0 21"
          scale="2 2 2"
          rotation="0 90 0"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallref1}
          position="20 0 31.4"
          scale="2 2 2"
          rotation="0 90 0"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallref2}
          position="25.9 0 26"
          scale="2 2 2"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallwithdoor}
          position="15 -0.1 26.2"
          scale="2 1.75 1.6"
          matrixAutoUpdate="false"
          rotation="0 180 0"
          gltf-model="#cellwallwithdoorModel"
        ></a-entity>

        <a-entity
          ref={Doorref}
          gltf-model="#standarddoorModel"
          position="14.97 0 26.2"
          rotation="0 180 0"
          scale="1 0.8 0.72"
        ></a-entity>

        <a-entity
          ref={npcpolice}
          gltf-model="#policeModel"
          position="14.97 0 40.2"
          rotation="0 180 0"
          scale="0.026 0.026 0.026"
        ></a-entity>
      </a-scene>

      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 9, left: 0, width: 20, height: 2, background: '#fff', boxShadow: '0 0 2px #000' }} />
        <div style={{ position: 'absolute', left: 9, top: 0, width: 2, height: 20, background: '#fff', boxShadow: '0 0 2px #000' }} />
      </div>

      <div
        ref={inventoryref}
        id="inventory-container"
      >
        {items.map((url, i) => GridShortCut(`/assets/${url}.png`, i))}
      </div>
    </div>
  );
}
</file>

</files>
