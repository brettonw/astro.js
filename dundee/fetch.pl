#! /usr/local/bin/perl

use strict;
use warnings;

# get the username and password
my $filename = "username.txt";
open(my $fh, "<:encoding(UTF-8)", $filename) or die "Could not open file '$filename' $!";
my $row = <$fh>;
chomp $row;
my ($username, $password) = split (/ /, $row);
print "USER: $username\nPASS: $password\n";

use WWW::Mechanize;

my $mech = WWW::Mechanize->new();
$mech -> get("http://www.sat.dundee.ac.uk/login.html");
$mech->submit_form(
    form_number => 1,
    fields    => {
        username => $username,
        password => $password,
    },
);

print $mech->content();
