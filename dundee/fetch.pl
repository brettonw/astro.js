#! /usr/local/bin/perl

use strict;
use warnings;

# get the username and password
sub getRow {
    my ($filename) = @_;
    open(my $fh, "<:encoding(UTF-8)", $filename) or die "Could not open file '$filename' $!";
    my $row = <$fh>;
    chomp $row;
    close $fh;
    return $row;
}
my ($username, $password) = split (/ /, getRow ("username.txt"));
print "USER: $username\nPASS: $password\n";

# set up the perl WWW mechanize
use WWW::Mechanize;
my $mech = WWW::Mechanize->new();

# log in to the Dundee station website
$mech->get("http://www.sat.dundee.ac.uk/login.html");
$mech->submit_form ( form_number => 1, fields => { username => $username, password => $password } );

# function to build a url for a given satellite record
sub buildUrl {
    my($satellite, $year, $month, $day, $utc) = @_;
    # MSG,3,000.0E,4,Meteosat 2nd Generation (aka SEVIRI)
    my ($id, $id2, $ra, $channel, $description) = split (/,/, $satellite);
    # print "Satellite: $description\n";
    my $size = 1;
    # http://www.sat.dundee.ac.uk/xrit/000.0E/MSG/2016/10/19/1200/2016_10_19_1200_MSG3_2_S2.jpeg
    return "http://www.sat.dundee.ac.uk/xrit/$ra/$id/$year/$month/$day/$utc/$year" . "_$month" . "_$day" . "_$utc" . "_$id$id2" . "_$channel" . "_S$size.jpeg";
}

# function to fetch all the source images for a date (year, month, day, utc)
sub fetchForDate {
    my($year, $month, $day, $time) = @_;
    #$month = sprintf ("%02d", $month);
    #$day = sprintf ("%02d", $day);
    # UTC has to be one of the 3 hour time intervals to avoid 24 delays and other restrictions, so
    # we simply round it
    my $utc = sprintf ("%03d", 300 * int (($time / 3) + 0.5));
    $utc = ($utc eq "000") ? "0" : $utc;

    # create the images directory
    my $dirName = "images";
    if (! (-d $dirName)) {
        mkdir $dirName;
    }

    # create the destination directory
    $dirName = "$dirName/$year$month$day-$utc";
    if (!(-d $dirName)) {
        print "Target: $dirName\n";
        mkdir ($dirName);

        # open the satellite list, and fetch the requested image for each one
        my $filename = "satellites.txt";
        open(my $fh, "<:encoding(UTF-8)", $filename) or die "Could not open file '$filename' $!";
        while (my $satellite = <$fh>) {
            chomp $satellite;
            if (!($satellite =~ /^\/\/\s*/)) {
                my ($id, $id2, $ra) = split (/,/, $satellite);
                my $url = buildUrl ($satellite, $year, $month, $day, $utc);
                print "Satellite: $id$id2 @ $ra for $year$month$day-$utc\n";
                $mech->get ($url, ":content_file" => "$dirName/$ra.jpg") or print "Could not fetch '$url' $!";
            }
        }
        close $fh;
    }
}

for (my $i = 1; $i <= 30; $i++) {
    fetchForDate (2016, 9, $i, 0);
}
